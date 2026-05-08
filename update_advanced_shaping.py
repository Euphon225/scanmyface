import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# I will completely replace window.renderAdvancedShaping
old_render = r'window\.renderAdvancedShaping = function\(result\) \{[\s\S]*?(?=// Intercept onResults|$)'
# But I removed "// Intercept onResults" earlier. Let's find exactly where it starts.
start_idx = content.find("window.renderAdvancedShaping = function(result) {")
if start_idx == -1:
    print("Function not found!")
    exit(1)

# I will find the end of the function by counting braces, or just doing a string replace.
# The previous renderAdvancedShaping ends with:
#     }
#     console.log("Rendu Façonnage Avancé généré");
# };
end_str = '    console.log("Rendu Façonnage Avancé généré");\n};'
end_idx = content.find(end_str, start_idx) + len(end_str)

if end_idx < len(end_str):
    print("Function end not found!")
    exit(1)

new_render = """window.renderAdvancedShaping = function(result) {
    if (!result) return;
    
    // 1. Colonne de Gauche (Image du Preset)
    if (inputImageNew) {
        inputImageNew.src = `./assets/presets/${result.preset.id}.png`;
        inputImageNew.classList.remove('hidden');
    }
    
    // Modifie le texte 'SCANNING' (ou SCAN ANALYSIS) en 'MODÈLE DE BASE'
    const scanLabel = document.querySelector('#new-scan-modal .font-label-caps.text-primary-container');
    if (scanLabel) {
        scanLabel.innerText = 'MODÈLE DE BASE';
        scanLabel.style.color = '#ffffff'; // Maybe neutral color ?
    }
    
    // Masque la progression et le laser
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) {
        laserLineNew.classList.remove('animate-pulse');
        laserLineNew.classList.add('hidden');
    }

    const container = document.getElementById('new-result-container');
    if (!container) return;
    
    // 2. Colonne de Droite (Le nouveau Zone Mix)
    container.innerHTML = '';
    
    const mainPresetObj = PRESETS_DB.find(p => p.preset_id === result.preset.id);
    let zoneMix = null;
    if (mainPresetObj) {
      zoneMix = computeZoneMix(result.ratios, mainPresetObj, PRESETS_DB);
    }
    
    // Génération dynamique du Zone Mix avec le nouveau design
    const zonesList = [
        { key: 'front', icon: 'face', label: t('zone.front') || 'Front' },
        { key: 'sourcils', icon: 'visibility', label: t('zone.sourcils') || 'Sourcils' },
        { key: 'yeux', icon: 'visibility', label: t('zone.yeux') || 'Yeux' },
        { key: 'nez', icon: 'face_2', label: t('zone.nez') || 'Nez' },
        { key: 'joues', icon: 'sentiment_satisfied', label: t('zone.joues') || 'Joues' },
        { key: 'bouche', icon: 'sentiment_neutral', label: t('zone.bouche') || 'Bouche' },
        { key: 'menton', icon: 'face_3', label: t('zone.menton') || 'Menton' },
        { key: 'machoire', icon: 'face_4', label: t('zone.machoire') || 'Mâchoire' }
    ];

    let mixHtml = `
        <div id="zone-mix-view" class="flex flex-col gap-md">
            <div style="margin-bottom: 8px;">
                <h3 class="font-title-sm text-title-sm text-on-surface uppercase tracking-tight">Zone Mix</h3>
                <p class="font-body-md text-[14px] text-on-surface-variant">L'IA a composé ce visage avec les presets suivants.</p>
            </div>
            
            <div class="bg-surface-container-low/60 rounded-lg p-md border border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-sm">
                    <span class="material-symbols-outlined text-tertiary-container text-[20px]">person</span>
                    <span class="font-title-sm text-[14px] text-on-surface uppercase font-bold">Base (Crâne)</span>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="font-title-sm text-[16px] text-tertiary-container font-bold">${result.preset.id}</span>
                    <button class="bg-white/5 hover:bg-white/10 transition-colors p-xs rounded text-on-surface-variant hover:text-white" onclick="window.copyValue(${result.preset.id}, this)">
                        <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                </div>
            </div>
    `;

    zonesList.forEach(zone => {
        const presetVal = zoneMix && zoneMix[zone.key] ? zoneMix[zone.key] : result.preset.id;
        mixHtml += `
            <div class="bg-surface-container-low/60 rounded-lg p-md border border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-sm">
                    <span class="material-symbols-outlined text-primary-container text-[20px]">${zone.icon}</span>
                    <span class="font-title-sm text-[14px] text-on-surface uppercase font-bold">${zone.label}</span>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="font-title-sm text-[16px] text-primary-container font-bold">${presetVal}</span>
                    <button class="bg-white/5 hover:bg-white/10 transition-colors p-xs rounded text-on-surface-variant hover:text-white" onclick="window.copyValue(${presetVal}, this)">
                        <span class="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                </div>
            </div>
        `;
    });

    // 3. Transition vers le Façonnage Avancé (Gros bouton)
    mixHtml += `
            <button id="btn-show-advanced" class="w-full mt-lg py-sm bg-primary-container text-[#0A0A0C] font-label-caps text-label-caps hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform rounded flex items-center justify-center gap-xs font-bold">
                <span class="material-symbols-outlined text-[18px]">tune</span>
                FAÇONNAGE AVANCÉ
            </button>
        </div>
        <div id="advanced-shaping-view" class="hidden flex-col gap-md">
            <!-- Accordéon généré ici par JS -->
        </div>
    `;
    
    container.innerHTML = mixHtml;

    // Attache l'événement au bouton pour basculer vers l'Accordéon
    document.getElementById('btn-show-advanced').addEventListener('click', () => {
        document.getElementById('zone-mix-view').classList.add('hidden');
        const advView = document.getElementById('advanced-shaping-view');
        advView.classList.remove('hidden');
        advView.style.display = 'flex';
        
        // Change Header Title again
        const headerTitle = document.querySelector('#new-scan-modal h2');
        if (headerTitle) headerTitle.innerText = "AJUSTEMENTS FINS";
        
        generateAdvancedAccordion(result, zoneMix, mainPresetObj, advView);
    });
};

function generateAdvancedAccordion(result, zoneMix, mainPresetObj, container) {
    if (!result.preset || !result.preset.avance) return;
    
    const mainPid = result.preset.id;
    const getZonePreset = mixKey => {
      if (!zoneMix || mixKey == null) return mainPresetObj;
      const pid = zoneMix[mixKey];
      return (pid != null ? PRESETS_DB.find(p => p.preset_id === pid) : null) ?? mainPresetObj;
    };

    const craneP    = getZonePreset(null);
    const frontP    = getZonePreset('front');
    const sourcilsP = getZonePreset('sourcils');
    const yeuxP     = getZonePreset('yeux');
    const nezP      = getZonePreset('nez');
    const jouesP    = getZonePreset('joues');
    const boucheP   = getZonePreset('bouche');
    const mentonP   = getZonePreset('menton');
    const machoireP = getZonePreset('machoire');

    const keyLabels = {
      re: t('slider.re'), bh: t('slider.bh'), na: t('slider.na'),
      aa: t('slider.aa'), ang: t('slider.ang'), gd: t('slider.gd'),
      nr: t('slider.nr'), nh: t('slider.nh'), gp: t('slider.gp')
    };

    const advZones = [
      { label: t('adv.zone.head'), icon: '👤', basePresetId: craneP?.preset_id, subs: [ { label: t('adv.crane.principal'), avanceKey: 'crane', noAdjust: true, data: craneP?.avance?.crane ? { re: craneP.avance.crane.re, bh: craneP.avance.crane.bh, aa: craneP.avance.crane.aa, ang: craneP.avance.crane.ang, gd: craneP.avance.crane.gd } : undefined }, { label: t('adv.crane.arriere'), avanceKey: 'arriere_crane', noAdjust: true, data: craneP?.avance?.arriere_crane ? { re: craneP.avance.arriere_crane.re, bh: craneP.avance.arriere_crane.bh, aa: craneP.avance.arriere_crane.aa, ang: craneP.avance.arriere_crane.ang, gd: craneP.avance.arriere_crane.gd } : undefined }, { label: t('adv.crane.tempes'), avanceKey: 'tempes', noAdjust: true, data: craneP?.avance?.tempes ? { re: craneP.avance.tempes.re, bh: craneP.avance.tempes.bh, aa: craneP.avance.tempes.aa, ang: craneP.avance.tempes.ang } : undefined } ] },
      { label: t('adv.zone.front'), icon: '🗣️', basePresetId: frontP?.preset_id, subs: [ { label: t('adv.front.sup'), avanceKey: 'front_sup', data: frontP?.avance?.front_sup }, { label: t('adv.front.inf'), avanceKey: 'front_inf', data: frontP?.avance?.front_inf }, ] },
      { label: t('adv.zone.brows'), icon: '👁️', basePresetId: sourcilsP?.preset_id, subs: [ { label: t('adv.sourcils.principal'), avanceKey: 'sourcils', data: sourcilsP?.avance?.sourcils }, { label: t('adv.sourcils.centre'), avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr }, { label: t('adv.sourcils.ext'), avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext }, ] },
      { label: t('adv.zone.eyes'), icon: '👁️', basePresetId: yeuxP?.preset_id, subs: [ { label: t('adv.yeux.principal'), avanceKey: 'yeux', data: yeuxP?.avance?.yeux }, { label: t('adv.yeux.orbites'), avanceKey: 'orbites', data: yeuxP?.avance?.orbites }, ] },
      { label: t('adv.zone.nose'), icon: '👃', basePresetId: nezP?.preset_id, subs: [ { label: t('adv.nez.principal'), avanceKey: 'nez_adv', data: nezP?.avance?.nez_adv }, { label: t('adv.nez.arete.cotes'), avanceKey: 'arete_cotes', data: nezP?.avance?.arete_cotes }, { label: t('adv.nez.arete.centre'), avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale }, { label: t('adv.nez.arete.sup'), avanceKey: 'arete_sup', data: nezP?.avance?.arete_sup }, ] },
      { label: t('adv.zone.cheeks'), icon: '😊', basePresetId: jouesP?.preset_id, subs: [ { label: t('adv.joues.principal'), avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv }, ] },
      { label: t('adv.zone.mouth'), icon: '👄', basePresetId: boucheP?.preset_id, subs: [ { label: t('adv.bouche.principal'), avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv }, { label: t('adv.bouche.ext'), avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext }, ] },
      { label: t('adv.zone.chin'), icon: '🫦', basePresetId: mentonP?.preset_id, subs: [ { label: t('adv.menton.principal'), avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv }, { label: t('adv.menton.sup'), avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup }, ] },
      { label: t('adv.zone.jaw'), icon: '💪', basePresetId: machoireP?.preset_id, subs: [ { label: t('adv.machoire.principal'), avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv }, { label: t('adv.machoire.maxillaire'), avanceKey: 'maxillaire', data: machoireP?.avance?.maxillaire }, { label: t('adv.machoire.mandibule'), avanceKey: 'mandibule', data: machoireP?.avance?.mandibule }, ] },
    ];

    let accHtml = '';
    advZones.forEach(zone => {
      const baseLabel = zone.basePresetId && zone.basePresetId !== mainPid
        ? `<span style="font-size:0.72rem; color:#b026ff; font-weight:400; margin-left:8px; opacity:0.85;">— base Preset ${zone.basePresetId}</span>`
        : '';

      let subsHtml = '';
      let zoneIsModified = false;

      zone.subs.forEach(sub => {
        if (!sub.data) return;

        const sliderEntries = Object.entries(sub.data).map(([key, val]) => {
          const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
          const isModified = adjVal !== undefined && Math.abs(adjVal - val) > 1;
          return { key, displayVal: isModified ? adjVal : val, isModified };
        });

        const subIsModified = sliderEntries.some(e => e.isModified);
        if (subIsModified) zoneIsModified = true;

        const subModBadge = subIsModified ? `<span style="color:#00f0ff; font-size:0.72rem; font-weight:bold; margin-left:6px;">(Modifié)</span>` : '';

        subsHtml += `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.78rem; color:#b026ff; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(176,38,255,0.2);">
              └ ${sub.label}${subModBadge}
            </div>
            ${sliderEntries.map(({ key, displayVal, isModified }) => `
              <div class="slider-row" style="padding:6px 0; margin-bottom:0; border-bottom:1px solid rgba(255,255,255,0.05); display: flex; align-items: center;">
                <div class="slider-info" style="flex:1;">
                  <div class="slider-name" style="font-size:0.82rem; color:var(--text-secondary);">
                    ${keyLabels[key] || key}
                  </div>
                </div>
                <div class="slider-value" style="font-size:1rem; min-width:32px; text-align:right; color:${isModified ? '#00f0ff' : '#ffffff'};">${displayVal}</div>
                <button class="bg-white/5 hover:bg-white/10 transition-colors p-[2px] px-sm rounded text-on-surface-variant hover:text-white" onclick="window.copyValue(${displayVal}, this)" style="margin-left:8px;">
                    <span class="material-symbols-outlined text-[14px]">content_copy</span>
                </button>
              </div>
            `).join('')}
          </div>
        `;
      });

      const zoneModBadge = zoneIsModified ? `<span style="color:#00f0ff; font-size:0.72rem; font-weight:bold; margin-left:6px;">(Modifié)</span>` : '';

      accHtml += `
        <div class="bg-surface-container/20 rounded-lg border border-white/5 overflow-hidden mb-sm">
            <div class="accordion-header" onclick="toggleAccordion(this)" style="padding: 12px; background: rgba(255,255,255,0.02); cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
              <span class="font-title-sm text-[14px] text-on-surface font-bold uppercase">${zone.icon} ${zone.label}${zoneModBadge}${baseLabel}</span>
              <span class="material-symbols-outlined text-on-surface-variant">expand_more</span>
            </div>
            <div class="accordion-content p-md">
              ${subsHtml}
            </div>
        </div>
      `;
    });
    
    container.innerHTML = accHtml;
    console.log("Rendu Façonnage Avancé généré");
}
"""

content = content[:start_idx] + new_render + content[end_idx:]

with open(js_path, 'w') as f:
    f.write(content)

print("Function renderAdvancedShaping completely refactored with 2-step UI.")
