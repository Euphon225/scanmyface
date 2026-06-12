"""slider_builder.py — port exact de la logique d'écriture de scanToSliders_v6.js,
en Mode A pur (J3.1).

1. INIT : 303 sliders = DNA de bestPresetGlobal (lookupPresetDNAByFamily précalculé).
2. PAR ZONE FLAME : écrase squelette+chair+graisse de la zone avec la DNA du preset
   matché-zone, sous garde de séparation (squelette > 0.15 ; chair/graisse > 0.05).
3. Lèvres/yeux : NON touchés (restent init bestPresetGlobal) → le client les écrit via signatures.
4. Orphelins squelette (crâne arrière/cou/...) : restent init bestPresetGlobal.

softClampSlider = round(clamp(v,0,100)) — identique au prod.
"""
from __future__ import annotations
import config as C


def _clamp(v):
    return int(round(min(100, max(0, v))))


def build_sliders(dna, best_global_id, zone_matches):
    """dna : DNABase. best_global_id : int. zone_matches : {group: match_dict}.
    Retourne {squelette, chair, graisse, _sources}."""
    out = {'squelette': {}, 'chair': {}, 'graisse': {}}
    src = {'squelette': {}, 'chair': {}, 'graisse': {}}

    # 1) INIT DNA bestPresetGlobal
    for fam in ('squelette', 'chair', 'graisse'):
        for k in dna.slider_keys_303[fam]:
            v = dna.dna(best_global_id, fam, k)
            if v is None:
                out[fam][k] = 50
                src[fam][k] = 'dna_missing'
            else:
                out[fam][k] = _clamp(v)
                src[fam][k] = 'dna'

    # 2) Écrasement par zone FLAME (Mode A pur, garde séparation)
    applied = {g: {'squelette': 0, 'chair': 0, 'graisse': 0, 'skipped_squelette': 0} for g in C.FLAME_GROUPS}
    for g in C.FLAME_GROUPS:
        m = zone_matches.get(g)
        if not m:
            continue
        pid = m['preset_id']
        sep = m['separation']
        for fam, sk in dna.group_slider_map[g]:
            if fam == 'squelette':
                if sep <= C.SEP_SQUELETTE:
                    applied[g]['skipped_squelette'] += 1
                    continue
            else:
                if sep <= C.SEP_CHAIR_GRAISSE:
                    continue
            v = dna.dna(pid, fam, sk)
            if v is None:
                continue
            out[fam][sk] = _clamp(v)
            src[fam][sk] = f'flame_zone:{g}'
            applied[g][fam] += 1

    out['_sources'] = src
    out['_applied'] = applied
    return out
