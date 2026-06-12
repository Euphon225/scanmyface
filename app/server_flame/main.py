"""main.py — service FastAPI FLAME. POST /api/flame-match.

Reçoit UNIQUEMENT les 478 landmarks (jamais la photo). In-memory, jamais persistés.
Logs : fit_time + preset_id + hash IP. CORS scanmyface.tech + localhost. Rate-limit 20/IP/h.
"""
from __future__ import annotations
import hashlib
import time
from collections import defaultdict, deque

import numpy as np
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

import config as C
from flame_matcher import FlameMatcher
from dna_loader import DNABase
from slider_builder import build_sliders

# Sentry optionnel (délégation #2 : tout échec FLAME loggé)
if C.SENTRY_DSN:
    try:
        import sentry_sdk
        sentry_sdk.init(dsn=C.SENTRY_DSN, traces_sample_rate=0.1)
    except Exception as e:
        print(f'[sentry] init fail: {e}')

app = FastAPI(title='ScanMyFace FLAME matcher', version=C.VERSION)
app.add_middleware(CORSMiddleware, allow_origins=C.CORS_ORIGINS,
                   allow_methods=['POST', 'GET'], allow_headers=['*'])

MATCHER: Optional[FlameMatcher] = None
DNA: Optional[DNABase] = None
_RATE = defaultdict(deque)   # ip_hash -> deque[timestamps]


@app.on_event('startup')
def _load():
    global MATCHER, DNA
    t0 = time.time()
    MATCHER = FlameMatcher()
    DNA = DNABase()
    print(f'[startup] FLAME + DNA chargés en {time.time()-t0:.1f}s '
          f'({len(MATCHER.all_ids)} presets, {DNA.meta["sliders_per_preset"]} sliders/preset)')


class MatchRequest(BaseModel):
    landmarks_478: List[List[float]]
    img_w: Optional[float] = None
    img_h: Optional[float] = None


def _ip_hash(req: Request) -> str:
    # Derrière nginx : vrai IP dans X-Forwarded-For (sinon tous les users = 127.0.0.1 = 1 bucket).
    xff = req.headers.get('x-forwarded-for') or req.headers.get('x-real-ip')
    ip = (xff.split(',')[0].strip() if xff else (req.client.host if req.client else 'unknown'))
    return hashlib.sha256(ip.encode()).hexdigest()[:12]


def _rate_ok(iph: str) -> bool:
    now = time.time()
    q = _RATE[iph]
    while q and now - q[0] > 3600:
        q.popleft()
    if len(q) >= C.RATE_LIMIT_PER_HOUR:
        return False
    q.append(now)
    return True


@app.get('/health')
def health():
    return {'ok': True, 'version': C.VERSION,
            'presets': len(MATCHER.all_ids) if MATCHER else 0,
            'flame_load_s': round(MATCHER.load_time_s, 2) if MATCHER else None}


@app.post('/api/flame-match')
async def flame_match(req: MatchRequest, request: Request):
    iph = _ip_hash(request)
    if not _rate_ok(iph):
        raise HTTPException(status_code=429, detail='rate_limited')
    if MATCHER is None or DNA is None:
        raise HTTPException(status_code=503, detail='not_ready')

    lm = req.landmarks_478
    if not (470 <= len(lm) <= 478):
        raise HTTPException(status_code=400, detail=f'expected ~478 landmarks, got {len(lm)}')

    # landmarks normalisés MediaPipe (x,y,z ∈ ~[0,1]) → pixels pour fit aspect-correct.
    w = req.img_w or 1.0
    h = req.img_h or 1.0
    px = np.array([[p[0] * w, p[1] * h, (p[2] if len(p) > 2 else 0.0) * w] for p in lm], dtype=np.float32)

    try:
        shape40, data_loss, fit_time, omega = MATCHER.fit(px)
        best_global, top5 = MATCHER.match_global(shape40)
        zone_details = {g: MATCHER.match_region(g, shape40) for g in C.FLAME_GROUPS}
        zone_matches = {g: zone_details[g]['preset_id'] for g in C.FLAME_GROUPS}
        sliders = build_sliders(DNA, best_global, zone_details)
    except Exception as e:
        if C.SENTRY_DSN:
            try:
                import sentry_sdk; sentry_sdk.capture_exception(e)
            except Exception:
                pass
        print(f'[error] ip={iph} fit/match fail: {e}')
        raise HTTPException(status_code=500, detail='fit_failed')

    print(f'[match] ip={iph} best={best_global} zones={zone_matches} '
          f'fit={fit_time:.1f}s loss={data_loss:.2e}')

    return {
        'bestPresetGlobal': best_global,
        'bestPresetInfo': DNA.preset_info(best_global),
        'zoneMatches': zone_matches,
        'zoneDetails': zone_details,
        'globalTop5': top5,
        'sliders_303': {'squelette': sliders['squelette'], 'chair': sliders['chair'],
                        'graisse': sliders['graisse'], '_sources': sliders['_sources']},
        'applied': sliders['_applied'],
        'fit_time_s': round(fit_time, 2),
        'data_loss': data_loss,
        'version': C.VERSION,
    }
