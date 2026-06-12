"""dna_loader.py — charge la base DNA pré-exportée + la carte zone→sliders.

presets_dna.json est précalculé par scripts/export_dna.js (vraie logique
lookupPresetDNAByFamily). Ici on ne fait que charger + construire la carte
groupe FLAME → [(family, slider_key)] depuis zone_groups + zone_definitions.
"""
from __future__ import annotations
import json
import config as C


class DNABase:
    def __init__(self):
        d = json.loads(C.PRESETS_DNA.read_text())
        self.presets = d['presets']                       # {id(str): {squelette,chair,graisse}}
        self.slider_keys_303 = d['_meta']['slider_keys_303']
        self.official_ids = d['_meta']['official_ids']
        self.celebrity_ids = d['_meta']['celebrity_ids']
        self.meta = {k: d['_meta'][k] for k in ('n_presets', 'sliders_per_preset')}

        zg = json.loads(C.ZONE_GROUPS.read_text())['groups']
        zd = json.loads(C.ZONE_DEFINITIONS.read_text())
        zones = zd.get('zones', zd)
        # groupe FLAME -> liste (family, slider_key)
        self.group_slider_map = {}
        for g in C.FLAME_GROUPS:
            pairs = []
            for subtab in zg[g]['subtabs']:
                zdef = zones.get(subtab)
                if not zdef:
                    continue
                fam = zdef.get('family')
                for sk in zdef.get('sliders', []):
                    pairs.append((fam, sk))
            self.group_slider_map[g] = pairs

    def dna(self, preset_id, family, key):
        """Valeur DNA précalculée (ou None). preset_id en int."""
        rec = self.presets.get(str(preset_id))
        if not rec:
            return None
        return rec.get(family, {}).get(key)

    def preset_info(self, preset_id):
        rec = self.presets.get(str(preset_id), {})
        return {'entry_type': rec.get('entry_type'), 'display_name': rec.get('display_name'),
                'forme_visage': rec.get('forme_visage'), 'couleur_peau': rec.get('couleur_peau')}
