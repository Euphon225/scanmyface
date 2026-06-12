# server_flame — service FLAME ScanMyFace (FastAPI, CPU)

Juge de matching FLAME pour FC26. Reçoit les 478 landmarks MediaPipe (jamais la photo),
fitte FLAME (400+400 iters ≈ 4,5 s M1), matche le preset le plus proche (cosine `shape[:40]`,
pool officiel pour la tête + régions Option A pour les zones), renvoie les 303 sliders en Mode A pur.

## Lancer en local

```bash
# venv avec torch CPU (réutilise celui du spike)
source ../admin/flame_spike/venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --app-dir .
curl http://127.0.0.1:8001/health
```

## Endpoint

`POST /api/flame-match`
```json
{ "landmarks_478": [[x,y,z], ...], "img_w": 1054, "img_h": 608 }
```
Réponse : `{ bestPresetGlobal, bestPresetInfo, zoneMatches, zoneDetails, globalTop5,
sliders_303:{squelette,chair,graisse,_sources}, applied, fit_time_s, data_loss, version }`.

- Landmarks **normalisés** MediaPipe (x,y,z ∈ ~[0,1]) + `img_w/img_h` → le serveur reconstruit les
  pixels (fit aspect-correct, identique au pipeline validé J2/J3).
- `sliders_303` : init DNA `bestPresetGlobal` + écrasement par zone FLAME (squelette+chair+graisse,
  garde séparation). **Lèvres/yeux NON écrits** (restent init) → le client les écrit via ses signatures.

## Fichiers de données requis (config.py)

| Fichier | Source |
|---|---|
| `flame2023_Open.pkl` | spike `data/` (CC-BY-4.0) |
| `mp_to_flame_66.json` | spike `data/` (embedding maison 65 lm) |
| `region_masks.json` | spike `data/` (5 masques) |
| `presets_dna.json` | `scripts/export_dna.js` (41×303, 0 null) |
| `preset_shapes/*.npz` | `scripts/fit_presets_j3.py` (41 shape40) |
| `zone_groups.json`, `zone_definitions.json` | **prod** `app/` (carte zone→sliders) |

En déploiement : copier ces fichiers dans `FLAME_DATA_DIR`/`FLAME_APP_DIR` (cf. config.py env vars).

## Déploiement (DigitalOcean droplet — cf. docs/ARCHITECTURE.md §F, ATTEND Alex #1)

```bash
# sur le droplet (Ubuntu, 2 vCPU/4 Go) :
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export FLAME_DATA_DIR=/srv/flame/data FLAME_APP_DIR=/srv/flame/app FLAME_OUT_DIR=/srv/flame/outputs
export SENTRY_DSN=...   # depuis Doppler
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 1
# derrière nginx + certbot (HTTPS), CORS = scanmyface.tech
```

## Sécurité
- Landmarks in-memory, jamais persistés (GC après réponse). Logs : fit_time + preset_id + hash IP.
- Rate-limit 20 fits/IP/h (in-memory). CORS = scanmyface.tech + localhost.
