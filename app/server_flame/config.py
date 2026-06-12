"""config.py — chemins + seuils du service FLAME.

DATA_DIR par défaut = la donnée du spike (dev local). En déploiement, copier
les fichiers listés ci-dessous dans un dossier et pointer FLAME_DATA_DIR dessus.
"""
import os
from pathlib import Path

# Racine spike (dev local) ; override possible via env pour le déploiement.
_SPIKE = Path(__file__).resolve().parent.parent / 'admin' / 'flame_spike'
_APP = Path(__file__).resolve().parent.parent

DATA_DIR = Path(os.environ.get('FLAME_DATA_DIR', str(_SPIKE / 'data')))
OUT_DIR = Path(os.environ.get('FLAME_OUT_DIR', str(_SPIKE / 'outputs')))
# zone_groups.json + zone_definitions.json = fichiers PROD (source de vérité).
APP_DIR = Path(os.environ.get('FLAME_APP_DIR', str(_APP)))

FLAME_PKL = DATA_DIR / 'flame2023_Open.pkl'
EMBEDDING = DATA_DIR / 'mp_to_flame_66.json'
REGION_MASKS = DATA_DIR / 'region_masks.json'
PRESETS_DNA = DATA_DIR / 'presets_dna.json'
PRESET_SHAPES = OUT_DIR / 'preset_shapes'
ZONE_GROUPS = APP_DIR / 'zone_groups.json'
ZONE_DEFINITIONS = APP_DIR / 'zone_definitions.json'

# Fit (profil prod validé J3 : convergence à ~250, marge à 400+400 ≈ 4,5 s M1).
N_DIM = 40
N_SHAPE = 100
N_EXPR = 50
RIGID_ITERS = 400
FULL_ITERS = 400

# Mode A pur — seuils de séparation par famille (DESIGN_MAPPING §D.2).
SEP_CHAIR_GRAISSE = 0.05      # une zone écrit chair/graisse si separation > 0.05
SEP_SQUELETTE = 0.15         # ... et son squelette seulement si separation > 0.15

# Les 5 groupes jugés par FLAME (les 3 autres = signatures MediaPipe côté client).
FLAME_GROUPS = ['nez', 'narines', 'joues', 'front', 'machoire_menton']

# Pool officiel = presets sélectionnables en jeu (preset_id < 10000).
OFFICIAL_MAX_ID = 10000

VERSION = 'flame-mvp-1.0'
CORS_ORIGINS = [
    'https://scanmyface.tech',
    'https://www.scanmyface.tech',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5500',
]
RATE_LIMIT_PER_HOUR = 20
SENTRY_DSN = os.environ.get('SENTRY_DSN', '')   # set en prod
