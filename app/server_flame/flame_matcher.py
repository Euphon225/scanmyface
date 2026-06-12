"""flame_matcher.py — fit FLAME (400+400) + matching global cosine + régions (Option A).

Self-contained (pas d'import depuis admin/flame_spike/scripts) pour être déployable.
La logique de fit est strictement celle validée J2/J3 (fit_flame.py) : 2-stage Adam,
projection Rodrigues, normalisation inter-pupillaire. Différence : on reçoit les
landmarks au lieu de les détecter (MediaPipe tourne dans le navigateur).
"""
from __future__ import annotations
import json
import pickle
import time
from pathlib import Path
import numpy as np
import torch

import config as C

_FLIP_Y = torch.tensor([1.0, -1.0], dtype=torch.float32)


def _rodrigues(omega):
    B = omega.shape[0]
    theta = omega.norm(dim=1, keepdim=True).clamp_min(1e-8)
    k = omega / theta
    K = torch.zeros(B, 3, 3, dtype=omega.dtype)
    K[:, 0, 1] = -k[:, 2]; K[:, 0, 2] = k[:, 1]
    K[:, 1, 0] = k[:, 2];  K[:, 1, 2] = -k[:, 0]
    K[:, 2, 0] = -k[:, 1]; K[:, 2, 1] = k[:, 0]
    I = torch.eye(3, dtype=omega.dtype).expand(B, 3, 3)
    return I + torch.sin(theta).view(-1, 1, 1) * K + (1 - torch.cos(theta)).view(-1, 1, 1) * (K @ K)


class FlameMatcher:
    def __init__(self):
        t0 = time.time()
        with C.FLAME_PKL.open('rb') as f:
            d = pickle.load(f, encoding='latin-1')

        def _np(x):
            if isinstance(x, np.ndarray):
                return x
            for a in ('r', 'x', 'data'):
                v = getattr(x, a, None)
                if isinstance(v, np.ndarray):
                    return v
            return np.asarray(x)

        self.v_template = torch.from_numpy(_np(d['v_template']).astype(np.float32))
        self.faces = _np(d['f']).astype(np.int64)
        sd = _np(d['shapedirs']).astype(np.float32)            # (V,3,400)
        total = sd.shape[2]
        shape_max = 300 if total >= 400 else total // 2
        self.shape_dirs = torch.from_numpy(sd[:, :, :C.N_SHAPE].copy())
        self.expr_dirs = torch.from_numpy(sd[:, :, shape_max:shape_max + C.N_EXPR].copy())
        self.sd40 = sd[:, :, :C.N_DIM].astype(np.float64)       # (V,3,40) numpy pour régions
        self.vtem_np = _np(d['v_template']).astype(np.float64)

        self.emb = json.loads(C.EMBEDDING.read_text())
        self.mp_indices = sorted(self.emb.keys(), key=lambda k: int(k))

        # ── OPTIM fit : le fit ne touche que les ~150 vertices derrière les 65 landmarks.
        # On précompte une forme réduite (v_template + dirs restreints à ces vertices) →
        # forward ~30× moins cher par itération (math identique, vertices inutiles ignorés).
        lm_faces = [self.emb[k]['flame_face'] for k in self.mp_indices]
        lm_bary = np.array([self.emb[k]['bary'] for k in self.mp_indices], dtype=np.float32)  # (65,3)
        tri_verts = self.faces[lm_faces]                              # (65,3) ids globaux
        uniq = np.unique(tri_verts)                                   # ~150 vertices
        remap = {int(v): i for i, v in enumerate(uniq)}
        tri_local = np.vectorize(remap.get)(tri_verts)               # (65,3) ids locaux
        self.v_template_lm = self.v_template[uniq]                    # (U,3)
        self.shape_dirs_lm = self.shape_dirs[uniq]                    # (U,3,100)
        self.expr_dirs_lm = self.expr_dirs[uniq]                      # (U,3,50)
        self.lm_bary_t = torch.from_numpy(lm_bary)                    # (65,3)
        self.lm_tri_local_t = torch.from_numpy(tri_local.astype(np.int64))  # (65,3)

        # Masques régions : indices vertices + sdR pré-extrait
        rm = json.loads(C.REGION_MASKS.read_text())
        self.region_verts = {g: np.asarray(rm[g]['vertices'], dtype=np.int64)
                             for g in C.FLAME_GROUPS}
        self.region_sd = {g: self.sd40[self.region_verts[g]] for g in C.FLAME_GROUPS}   # (|R|,3,40)
        self.region_vt = {g: self.vtem_np[self.region_verts[g]] for g in C.FLAME_GROUPS}

        # Preset shapes : shape40 par preset_id
        self.preset_shapes = {}
        for f in sorted(C.PRESET_SHAPES.glob('*.npz'), key=lambda p: int(p.stem)):
            pid = int(f.stem)
            self.preset_shapes[pid] = np.load(f)['shape40'].astype(np.float64)
        self.official_ids = [i for i in self.preset_shapes if i < C.OFFICIAL_MAX_ID]
        self.all_ids = list(self.preset_shapes.keys())

        # Pré-calcul des vertices de région recentrés par preset (rapide au runtime)
        self.preset_region_centered = {g: {} for g in C.FLAME_GROUPS}
        for g in C.FLAME_GROUPS:
            for pid, s40 in self.preset_shapes.items():
                v = self.region_vt[g] + np.einsum('vik,k->vi', self.region_sd[g], s40)
                self.preset_region_centered[g][pid] = v - v.mean(0, keepdims=True)

        self.load_time_s = time.time() - t0

    # ── geometry ────────────────────────────────────────────────────────
    def _forward(self, shape, expr):
        verts = self.v_template.unsqueeze(0).expand(shape.shape[0], -1, -1).clone()
        verts = verts + torch.einsum('vis,bs->bvi', self.shape_dirs, shape)
        verts = verts + torch.einsum('vis,bs->bvi', self.expr_dirs, expr)
        return verts

    def _flame_landmarks(self, verts):
        out = []
        for mp_idx in self.mp_indices:
            e = self.emb[mp_idx]
            tri = self.faces[e['flame_face']]
            bary = torch.tensor(e['bary'], dtype=torch.float32)
            p = bary[0] * verts[:, tri[0]] + bary[1] * verts[:, tri[1]] + bary[2] * verts[:, tri[2]]
            out.append(p)
        return torch.stack(out, dim=1)

    # Forward + landmarks RÉDUITS aux ~150 vertices utiles (fit only). Math identique.
    def _forward_lm(self, shape, expr):
        verts = self.v_template_lm.unsqueeze(0).expand(shape.shape[0], -1, -1).clone()
        verts = verts + torch.einsum('vis,bs->bvi', self.shape_dirs_lm, shape)
        verts = verts + torch.einsum('vis,bs->bvi', self.expr_dirs_lm, expr)
        return verts                                          # (B,U,3)

    def _flame_landmarks_fast(self, verts_lm):
        v = verts_lm[:, self.lm_tri_local_t]                  # (B,65,3,3)
        return (v * self.lm_bary_t[None, :, :, None]).sum(2)  # (B,65,3)

    def _obs_from_landmarks(self, landmarks_px):
        """landmarks_px : np (478,2|3) en pixels. Normalisation inter-pupillaire (idem fit_flame)."""
        lm = np.asarray(landmarks_px, dtype=np.float32)
        sub = np.stack([lm[int(i), :2] for i in self.mp_indices], axis=0)
        center = lm[4, :2]
        eye_d = float(np.linalg.norm(lm[263, :2] - lm[33, :2]))
        if eye_d < 1e-6:
            eye_d = 1.0
        sub_norm = (sub - center) / eye_d * 0.30 + np.array([0.5, 0.5])
        return torch.from_numpy(sub_norm.astype(np.float32)).unsqueeze(0)

    # ── fit ─────────────────────────────────────────────────────────────
    def fit(self, landmarks_px):
        obs = self._obs_from_landmarks(landmarks_px)
        shape = torch.zeros(1, C.N_SHAPE, requires_grad=True)
        expr = torch.zeros(1, C.N_EXPR, requires_grad=True)
        scale = torch.full((1,), 1.87, requires_grad=True)
        trans = torch.zeros(1, 3, requires_grad=True)
        trans.data[:, 0] = 0.5; trans.data[:, 1] = 0.5
        omega = torch.full((1, 3), 1e-3, requires_grad=True)

        def project(lm3d, om, sc, tr):
            R = _rodrigues(om)
            rot = torch.einsum('bvi,bji->bvj', lm3d, R)
            return rot[..., :2] * _FLIP_Y * sc.view(-1, 1, 1) + tr[:, None, :2]

        t0 = time.perf_counter()
        opt_r = torch.optim.Adam([{'params': [omega], 'lr': 1e-2},
                                  {'params': [scale], 'lr': 5e-2},
                                  {'params': [trans], 'lr': 5e-2}])
        for _ in range(C.RIGID_ITERS):
            opt_r.zero_grad()
            proj = project(self._flame_landmarks_fast(self._forward_lm(shape, expr)), omega, scale, trans)
            (((proj - obs) ** 2).mean()).backward(); opt_r.step()

        opt = torch.optim.Adam([{'params': [shape], 'lr': 1e-2}, {'params': [expr], 'lr': 5e-3},
                                {'params': [omega], 'lr': 5e-3}, {'params': [scale], 'lr': 5e-3},
                                {'params': [trans], 'lr': 5e-3}])
        last = None
        for _ in range(C.FULL_ITERS):
            opt.zero_grad()
            proj = project(self._flame_landmarks_fast(self._forward_lm(shape, expr)), omega, scale, trans)
            data = ((proj - obs) ** 2).mean()
            loss = data + 1e-5 * (shape ** 2).sum() + 1e-4 * (expr ** 2).sum()
            loss.backward(); opt.step(); last = float(data.item())
        dt = time.perf_counter() - t0
        return shape.detach().numpy()[0][:C.N_DIM].astype(np.float64), float(last), dt, omega.detach().numpy()[0]

    # ── matching ────────────────────────────────────────────────────────
    @staticmethod
    def _cosd(a, b):
        return 1.0 - float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def match_global(self, shape40):
        ranked = sorted(self.official_ids, key=lambda i: self._cosd(shape40, self.preset_shapes[i]))
        return ranked[0], [{'preset_id': i, 'cos_dist': round(self._cosd(shape40, self.preset_shapes[i]), 5)}
                           for i in ranked[:5]]

    def match_region(self, g, shape40):
        v = self.region_vt[g] + np.einsum('vik,k->vi', self.region_sd[g], shape40)
        cu = v - v.mean(0, keepdims=True)
        dists = []
        for pid in self.all_ids:                         # pool complet (41) pour la DNA zone
            cp = self.preset_region_centered[g][pid]
            d = float(np.sqrt(((cu - cp) ** 2).sum(1).mean()))
            dists.append((pid, d))
        dists.sort(key=lambda x: x[1])
        best_id, d1 = dists[0]
        d2 = dists[1][1] if len(dists) > 1 else d1
        sep = (d2 - d1) / d1 if d1 > 1e-12 else 1.0
        return {'preset_id': best_id, 'distance': round(d1 * 1000, 4),
                'separation': round(sep, 4), 'top3': [{'id': i, 'd': round(d * 1000, 4)} for i, d in dists[:3]]}
