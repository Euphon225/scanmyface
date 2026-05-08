import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

old_select_preset = r'window\.selectPresetNew = function\(event, presetId\) \{[\s\S]*?(?=// ==========================================|$)'
# We will replace it until the end of the file, since it's the last function.
# Let's find exactly where it starts.
start_idx = content.find("window.selectPresetNew = function(event, presetId) {")

new_select_preset = """window.selectPresetNew = function(event, presetId) {
    if (event) event.preventDefault();
    
    if (!state.pendingAnalysis) return;
    const { landmarks, skinTone, skinMeta, scores } = state.pendingAnalysis;
    const chosenPreset = PRESETS_DB.find(p => p.preset_id === presetId);
    if (!chosenPreset) return;

    state.results = analyzeWithPreset(landmarks, skinTone, chosenPreset, scores);
    state.results.skinMeta = skinMeta;
    
    // Update Header Text
    const headerTitle = document.querySelector('#new-scan-modal h2');
    if (headerTitle) headerTitle.innerText = "FAÇONNAGE AVANCÉ";
    
    const headerTextElements = document.querySelectorAll('#new-scan-modal p');
    headerTextElements.forEach(p => {
        if (p.innerText.includes("L'IA a trouvé")) {
            p.innerText = "Ajuste les curseurs pour correspondre parfaitement au preset.";
        }
    });
    
    window.renderAdvancedShaping(state.results);
};

window.renderAdvancedShaping = function(result) {
    if (!result) return;
    
    const container = document.getElementById('new-result-container');
    if (!container) return;
    
    // Clear Top Matches
    container.innerHTML = '';
    
    // 1. Header Card (ID Card)
    let headerHtml = `
        <div class="preset-header" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1)); border: 1px solid gold; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: gold; text-align: center;">
            <h2 style="margin-top:0; font-size:1.2rem;">${t('results.title')}</h2>
            <div class="preset-card">
                <p style="margin:5px 0;">${t('step1.title')}</p>
                <h3 style="margin:5px 0; font-size:1.5rem;">➡️ ${result.preset.label}</h3>
                <p style="margin:0; font-size:0.9rem; opacity:0.8;">Preset ID : ${result.preset.id}</p>
                <img src="./assets/presets/${result.preset.id}.png" class="preset-preview-img" alt="Visage recommandé" onerror="this.style.display='none'">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', headerHtml);

    // 2. Zone Mix
    const mainPresetObj = PRESETS_DB.find(p => p.preset_id === result.preset.id);
    let zoneMix = null;
    if (mainPresetObj) {
      zoneMix = computeZoneMix(result.ratios, mainPresetObj, PRESETS_DB);
      container.appendChild(renderZoneMix(zoneMix));
    }

    // 3. Advanced Shaping Accordion
    if (result.preset && result.preset.avance) {
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

        let advTitleHtml = `
          <div style="margin: 24px 0 12px; padding: 12px 16px; background: linear-gradient(135deg, rgba(176,38,255,0.1), rgba(0,240,255,0.05)); border: 1px solid rgba(176,38,255,0.3); border-radius: 8px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size:1.2rem">🔬</span>
            <div>
              <div style="font-family:'Outfit',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:#b026ff; font-size:0.9rem;">
                ${t('adv.title')}
              </div>
              <div style="font-size:0.75rem; color:#666; margin-top:2px;">
                ${t('adv.desc')}
              </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', advTitleHtml);

        const advAccordion = document.createElement('div');
        advAccordion.className = 'accordion';

        advZones.forEach(zone => {
          const item = document.createElement('div');
          item.className = 'accordion-item';

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
                    <button class="btn-copy" onclick="copyValue(${displayVal}, this)" style="margin-left:8px; background: rgba(255,255,255,0.1); border:none; border-radius: 4px; padding: 2px 6px; cursor: pointer; color: white;">Copy</button>
                  </div>
                `).join('')}
              </div>
            `;
          });

          const zoneModBadge = zoneIsModified ? `<span style="color:#00f0ff; font-size:0.72rem; font-weight:bold; margin-left:6px;">(Modifié)</span>` : '';

          item.innerHTML = `
            <div class="accordion-header" onclick="toggleAccordion(this)" style="padding: 10px; background: rgba(255,255,255,0.05); cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between;">
              <span>${zone.icon} ${zone.label}${zoneModBadge}${baseLabel}</span>
              <span>▼</span>
            </div>
            <div class="accordion-content" style="padding: 10px; display: none;">
              ${subsHtml}
            </div>
          `;
          advAccordion.appendChild(item);
        });

        container.appendChild(advAccordion);
    }
};
"""

content = content[:start_idx] + new_select_preset
with open(js_path, 'w') as f:
    f.write(content)

print("selectPresetNew and renderAdvancedShaping updated.")
