import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 1: Highlight Modified Sliders
# -------------------------------------------------------------
old_slider_logic = """                const displayVal = isModified ? adjVal : safeVal;
                const colorClass = isModified ? 'text-primary-container' : 'text-primary-container';
                const labelName = keyLabels[key] || key;
                
                slidersHtml += `
                    <div>
                        <div class="flex items-center justify-between font-label-caps text-[10px] text-on-surface-variant mb-2">
                            <span>${labelName}</span>
                            <div class="flex items-center gap-xs bg-surface-container-highest px-2 py-0.5 rounded border border-white/10">
                                <span class="${colorClass} font-bold text-[12px]">${displayVal}</span>
                                <button class="text-on-surface-variant hover:text-primary-container transition-colors" title="Copy" onclick="window.copyValue(${displayVal}, this)">
                                    <span class="material-symbols-outlined text-[12px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                        <input type="range" min="0" max="100" value="${displayVal}" disabled class="opacity-80 cursor-not-allowed">
                    </div>
                `;"""

new_slider_logic = """                const displayVal = isModified ? adjVal : safeVal;
                const colorClass = isModified ? 'text-primary-container' : 'text-on-surface';
                const labelName = isModified ? `${keyLabels[key] || key} ✨` : (keyLabels[key] || key);
                const highlightClass = isModified ? 'p-2 -mx-2 rounded bg-primary-container/10 border border-primary-container/30 shadow-[0_0_10px_rgba(0,240,255,0.1)_inset]' : '';
                
                slidersHtml += `
                    <div class="${highlightClass}">
                        <div class="flex items-center justify-between font-label-caps text-[10px] ${isModified ? 'text-primary-container' : 'text-on-surface-variant'} mb-2">
                            <span>${labelName}</span>
                            <div class="flex items-center gap-xs bg-surface-container-highest px-2 py-0.5 rounded border border-white/10">
                                <span class="${colorClass} font-bold text-[12px]">${displayVal}</span>
                                <button class="text-on-surface-variant hover:text-primary-container transition-colors" title="Copy" onclick="window.copyValue(${displayVal}, this)">
                                    <span class="material-symbols-outlined text-[12px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                        <input type="range" min="0" max="100" value="${displayVal}" disabled class="opacity-80 cursor-not-allowed ${isModified ? 'accent-primary-container' : ''}">
                    </div>
                `;"""
content = content.replace(old_slider_logic, new_slider_logic)


# -------------------------------------------------------------
# TASK 2 & 3: Full FC26 Hierarchy and Emojis
# -------------------------------------------------------------
# We rewrite the advZones structure to be perfect according to DB
# DB advanced keys:
# crane, couronne, arriere_crane, tempes
# front_sup, front_inf
# sourcils, sourcils_ctr, sourcils_ext
# yeux, orbites
# nez_adv, arete_cotes, arete_centrale, arete_sup
# joues_adv
# bouche_adv, bouche_ext
# menton_adv, menton_sup
# machoire_adv, maxillaire, mandibule

old_adv_zones_regex = r"const advZones = \[(.*?)\];"
# I will use string replace for the whole block to be safe.
old_adv_block = """    const advZones = [
      { id: 'tab-crane', label: t('adv.zone.head') || 'Tête', icon: 'face', basePresetId: craneP?.preset_id, subs: [ { label: t('adv.crane.principal') || 'Crâne principal', avanceKey: 'crane', noAdjust: true, data: craneP?.avance?.crane ? { re: craneP.avance.crane.re, bh: craneP.avance.crane.bh, aa: craneP.avance.crane.aa, ang: craneP.avance.crane.ang, gd: craneP.avance.crane.gd } : undefined }, { label: t('adv.crane.arriere') || 'Arrière du crâne', avanceKey: 'arriere_crane', noAdjust: true, data: craneP?.avance?.arriere_crane ? { re: craneP.avance.arriere_crane.re, bh: craneP.avance.arriere_crane.bh, aa: craneP.avance.arriere_crane.aa, ang: craneP.avance.arriere_crane.ang, gd: craneP.avance.arriere_crane.gd } : undefined }, { label: t('adv.crane.tempes') || 'Couronne', avanceKey: 'tempes', noAdjust: true, data: craneP?.avance?.tempes ? { re: craneP.avance.tempes.re, bh: craneP.avance.tempes.bh, aa: craneP.avance.tempes.aa, ang: craneP.avance.tempes.ang } : undefined } ] },
      { id: 'tab-front', label: t('adv.zone.front') || 'Front', icon: 'face_5', basePresetId: frontP?.preset_id, subs: [ { label: t('adv.front.sup') || 'Front supérieur', avanceKey: 'front_sup', data: frontP?.avance?.front_sup }, { label: t('adv.front.inf') || 'Front inférieur', avanceKey: 'front_inf', data: frontP?.avance?.front_inf }, ] },
      { id: 'tab-sourcils', label: t('adv.zone.brows') || 'Sourcils', icon: 'visibility', basePresetId: sourcilsP?.preset_id, subs: [ { label: t('adv.sourcils.principal') || 'Sourcils', avanceKey: 'sourcils', data: sourcilsP?.avance?.sourcils }, { label: t('adv.sourcils.centre') || 'Centre des sourcils', avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr }, { label: t('adv.sourcils.ext') || 'Extérieur des sourcils', avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext }, ] },
      { id: 'tab-yeux', label: t('adv.zone.eyes') || 'Yeux', icon: 'visibility', basePresetId: yeuxP?.preset_id, subs: [ { label: t('adv.yeux.principal') || 'Yeux', avanceKey: 'yeux', data: yeuxP?.avance?.yeux }, { label: t('adv.yeux.orbites') || 'Orbites', avanceKey: 'orbites', data: yeuxP?.avance?.orbites }, ] },
      { id: 'tab-nez', label: t('adv.zone.nose') || 'Nez', icon: 'face_2', basePresetId: nezP?.preset_id, subs: [ { label: t('adv.nez.principal') || 'Nez', avanceKey: 'nez_adv', data: nezP?.avance?.nez_adv }, { label: t('adv.nez.arete.cotes') || 'Arête (côtés)', avanceKey: 'arete_cotes', data: nezP?.avance?.arete_cotes }, { label: t('adv.nez.arete.centre') || 'Arête (centre)', avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale }, { label: t('adv.nez.arete.sup') || 'Arête (supérieure)', avanceKey: 'arete_sup', data: nezP?.avance?.arete_sup }, ] },
      { id: 'tab-joues', label: t('adv.zone.cheeks') || 'Joues', icon: 'sentiment_satisfied', basePresetId: jouesP?.preset_id, subs: [ { label: t('adv.joues.principal') || 'Joues', avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv }, ] },
      { id: 'tab-bouche', label: t('adv.zone.mouth') || 'Bouche', icon: 'sentiment_neutral', basePresetId: boucheP?.preset_id, subs: [ { label: t('adv.bouche.principal') || 'Bouche', avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv }, { label: t('adv.bouche.ext') || 'Extérieur', avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext }, ] },
      { id: 'tab-menton', label: t('adv.zone.chin') || 'Menton', icon: 'face_3', basePresetId: mentonP?.preset_id, subs: [ { label: t('adv.menton.principal') || 'Menton', avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv }, { label: t('adv.menton.sup') || 'Supérieur', avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup }, ] },
      { id: 'tab-machoire', label: t('adv.zone.jaw') || 'Mâchoire', icon: 'face_4', basePresetId: machoireP?.preset_id, subs: [ { label: t('adv.machoire.principal') || 'Mâchoire', avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv }, { label: t('adv.machoire.maxillaire') || 'Maxillaire', avanceKey: 'maxillaire', data: machoireP?.avance?.maxillaire }, { label: t('adv.machoire.mandibule') || 'Mandibule', avanceKey: 'mandibule', data: machoireP?.avance?.mandibule }, ] },
    ];"""

new_adv_block = """    const advZones = [
      { id: 'tab-crane', emoji: '👤', label: t('adv.zone.head') || 'Tête', icon: 'face', basePresetId: craneP?.preset_id, subs: [ 
          { label: t('adv.crane.principal') || 'Crâne principal', avanceKey: 'crane', noAdjust: true, data: craneP?.avance?.crane ? { re: craneP.avance.crane.re, bh: craneP.avance.crane.bh, aa: craneP.avance.crane.aa, ang: craneP.avance.crane.ang, gd: craneP.avance.crane.gd } : undefined }, 
          { label: t('adv.crane.couronne') || 'Couronne', avanceKey: 'couronne', noAdjust: true, data: craneP?.avance?.couronne ? { re: craneP.avance.couronne.re, bh: craneP.avance.couronne.bh, aa: craneP.avance.couronne.aa, nr: craneP.avance.couronne.nr, gd: craneP.avance.couronne.gd } : undefined }, 
          { label: t('adv.crane.arriere') || 'Arrière du crâne', avanceKey: 'arriere_crane', noAdjust: true, data: craneP?.avance?.arriere_crane ? { re: craneP.avance.arriere_crane.re, bh: craneP.avance.arriere_crane.bh, aa: craneP.avance.arriere_crane.aa, ang: craneP.avance.arriere_crane.ang, gd: craneP.avance.arriere_crane.gd } : undefined }, 
          { label: t('adv.crane.tempes') || 'Tempes', avanceKey: 'tempes', noAdjust: true, data: craneP?.avance?.tempes ? { re: craneP.avance.tempes.re, bh: craneP.avance.tempes.bh, aa: craneP.avance.tempes.aa, ang: craneP.avance.tempes.ang } : undefined } 
      ] },
      { id: 'tab-front', emoji: '🗣️', label: t('adv.zone.front') || 'Front', icon: 'psychology', basePresetId: frontP?.preset_id, subs: [ 
          { label: t('adv.front.sup') || 'Front supérieur', avanceKey: 'front_sup', data: frontP?.avance?.front_sup }, 
          { label: t('adv.front.inf') || 'Front inférieur', avanceKey: 'front_inf', data: frontP?.avance?.front_inf }, 
      ] },
      { id: 'tab-sourcils', emoji: '👁️', label: t('adv.zone.brows') || 'Sourcils', icon: 'visibility', basePresetId: sourcilsP?.preset_id, subs: [ 
          { label: t('adv.sourcils.principal') || 'Sourcils', avanceKey: 'sourcils', data: sourcilsP?.avance?.sourcils }, 
          { label: t('adv.sourcils.centre') || 'Centre des sourcils', avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr }, 
          { label: t('adv.sourcils.ext') || 'Extérieur des sourcils', avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext }, 
      ] },
      { id: 'tab-yeux', emoji: '👁️', label: t('adv.zone.eyes') || 'Yeux', icon: 'visibility', basePresetId: yeuxP?.preset_id, subs: [ 
          { label: t('adv.yeux.principal') || 'Yeux', avanceKey: 'yeux', data: yeuxP?.avance?.yeux }, 
          { label: t('adv.yeux.orbites') || 'Orbites', avanceKey: 'orbites', data: yeuxP?.avance?.orbites }, 
      ] },
      { id: 'tab-nez', emoji: '👃', label: t('adv.zone.nose') || 'Nez', icon: 'face_2', basePresetId: nezP?.preset_id, subs: [ 
          { label: t('adv.nez.principal') || 'Nez', avanceKey: 'nez_adv', data: nezP?.avance?.nez_adv }, 
          { label: t('adv.nez.arete.cotes') || 'Arête (côtés)', avanceKey: 'arete_cotes', data: nezP?.avance?.arete_cotes }, 
          { label: t('adv.nez.arete.centre') || 'Arête (centre)', avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale }, 
          { label: t('adv.nez.arete.sup') || 'Arête (supérieure)', avanceKey: 'arete_sup', data: nezP?.avance?.arete_sup }, 
      ] },
      { id: 'tab-joues', emoji: '😊', label: t('adv.zone.cheeks') || 'Joues', icon: 'sentiment_satisfied', basePresetId: jouesP?.preset_id, subs: [ 
          { label: t('adv.joues.principal') || 'Joues', avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv }, 
      ] },
      { id: 'tab-bouche', emoji: '👄', label: t('adv.zone.mouth') || 'Bouche', icon: 'sentiment_neutral', basePresetId: boucheP?.preset_id, subs: [ 
          { label: t('adv.bouche.principal') || 'Bouche', avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv }, 
          { label: t('adv.bouche.ext') || 'Extérieur', avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext }, 
      ] },
      { id: 'tab-menton', emoji: '🫦', label: t('adv.zone.chin') || 'Menton', icon: 'face_3', basePresetId: mentonP?.preset_id, subs: [ 
          { label: t('adv.menton.principal') || 'Menton', avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv }, 
          { label: t('adv.menton.sup') || 'Supérieur', avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup }, 
      ] },
      { id: 'tab-machoire', emoji: '💪', label: t('adv.zone.jaw') || 'Mâchoire', icon: 'face_4', basePresetId: machoireP?.preset_id, subs: [ 
          { label: t('adv.machoire.principal') || 'Mâchoire', avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv }, 
          { label: t('adv.machoire.maxillaire') || 'Maxillaire', avanceKey: 'maxillaire', data: machoireP?.avance?.maxillaire }, 
          { label: t('adv.machoire.mandibule') || 'Mandibule', avanceKey: 'mandibule', data: machoireP?.avance?.mandibule }, 
      ] },
    ];"""

content = content.replace(old_adv_block, new_adv_block)

# Update HTML generation for Tabs to include emojis
old_tab_html = "                <span class=\"material-symbols-outlined text-[16px]\">${zone.icon}</span> ${zone.label}"
new_tab_html = "                <span class=\"material-symbols-outlined text-[16px]\">${zone.icon}</span> ${zone.emoji} ${zone.label}"
content = content.replace(old_tab_html, new_tab_html)

# -------------------------------------------------------------
# TASK 4: Final Text Update (.gg -> .tech)
# -------------------------------------------------------------
content = content.replace('SCANMYFACE.gg', 'SCANMYFACE.tech')

with open(js_path, 'w') as f:
    f.write(content)

print("Final Polish UI fixes applied.")
