import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 1: Zone Mix icons (if needed, but I already did this, just to be sure)
# -------------------------------------------------------------
# Already handled in renderAdvancedShaping via zonesList

# -------------------------------------------------------------
# TASK 2: Advanced Shaping UI Overhaul
# -------------------------------------------------------------
start_func = content.find("function generateAdvancedAccordion(result, zoneMix, mainPresetObj, container) {")
if start_func == -1:
    print("Function generateAdvancedAccordion not found!")
    exit(1)

# Find the end of the function
end_str = '    console.log("Rendu Façonnage Avancé généré");\n}'
end_idx = content.find(end_str, start_func)
if end_idx == -1:
    print("Function end not found!")
    exit(1)
end_idx += len(end_str)

new_func = """function generateAdvancedAccordion(result, zoneMix, mainPresetObj, container) {
    if (!result.preset || !result.preset.avance) return;
    
    // Override container classes to match the design (flex layout instead of just flex-col gap-md)
    container.className = 'w-full flex flex-col h-full bg-surface-container-low/50 relative';
    
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
      { id: 'tab-crane', label: t('adv.zone.head') || 'Tête', icon: 'face', basePresetId: craneP?.preset_id, subs: [ { label: t('adv.crane.principal') || 'Crâne principal', avanceKey: 'crane', noAdjust: true, data: craneP?.avance?.crane ? { re: craneP.avance.crane.re, bh: craneP.avance.crane.bh, aa: craneP.avance.crane.aa, ang: craneP.avance.crane.ang, gd: craneP.avance.crane.gd } : undefined }, { label: t('adv.crane.arriere') || 'Arrière du crâne', avanceKey: 'arriere_crane', noAdjust: true, data: craneP?.avance?.arriere_crane ? { re: craneP.avance.arriere_crane.re, bh: craneP.avance.arriere_crane.bh, aa: craneP.avance.arriere_crane.aa, ang: craneP.avance.arriere_crane.ang, gd: craneP.avance.arriere_crane.gd } : undefined }, { label: t('adv.crane.tempes') || 'Couronne', avanceKey: 'tempes', noAdjust: true, data: craneP?.avance?.tempes ? { re: craneP.avance.tempes.re, bh: craneP.avance.tempes.bh, aa: craneP.avance.tempes.aa, ang: craneP.avance.tempes.ang } : undefined } ] },
      { id: 'tab-front', label: t('adv.zone.front') || 'Front', icon: 'face_5', basePresetId: frontP?.preset_id, subs: [ { label: t('adv.front.sup') || 'Front supérieur', avanceKey: 'front_sup', data: frontP?.avance?.front_sup }, { label: t('adv.front.inf') || 'Front inférieur', avanceKey: 'front_inf', data: frontP?.avance?.front_inf }, ] },
      { id: 'tab-sourcils', label: t('adv.zone.brows') || 'Sourcils', icon: 'visibility', basePresetId: sourcilsP?.preset_id, subs: [ { label: t('adv.sourcils.principal') || 'Sourcils', avanceKey: 'sourcils', data: sourcilsP?.avance?.sourcils }, { label: t('adv.sourcils.centre') || 'Centre des sourcils', avanceKey: 'sourcils_ctr', data: sourcilsP?.avance?.sourcils_ctr }, { label: t('adv.sourcils.ext') || 'Extérieur des sourcils', avanceKey: 'sourcils_ext', data: sourcilsP?.avance?.sourcils_ext }, ] },
      { id: 'tab-yeux', label: t('adv.zone.eyes') || 'Yeux', icon: 'visibility', basePresetId: yeuxP?.preset_id, subs: [ { label: t('adv.yeux.principal') || 'Yeux', avanceKey: 'yeux', data: yeuxP?.avance?.yeux }, { label: t('adv.yeux.orbites') || 'Orbites', avanceKey: 'orbites', data: yeuxP?.avance?.orbites }, ] },
      { id: 'tab-nez', label: t('adv.zone.nose') || 'Nez', icon: 'face_2', basePresetId: nezP?.preset_id, subs: [ { label: t('adv.nez.principal') || 'Nez', avanceKey: 'nez_adv', data: nezP?.avance?.nez_adv }, { label: t('adv.nez.arete.cotes') || 'Arête (côtés)', avanceKey: 'arete_cotes', data: nezP?.avance?.arete_cotes }, { label: t('adv.nez.arete.centre') || 'Arête (centre)', avanceKey: 'arete_centrale', data: nezP?.avance?.arete_centrale }, { label: t('adv.nez.arete.sup') || 'Arête (supérieure)', avanceKey: 'arete_sup', data: nezP?.avance?.arete_sup }, ] },
      { id: 'tab-joues', label: t('adv.zone.cheeks') || 'Joues', icon: 'sentiment_satisfied', basePresetId: jouesP?.preset_id, subs: [ { label: t('adv.joues.principal') || 'Joues', avanceKey: 'joues_adv', data: jouesP?.avance?.joues_adv }, ] },
      { id: 'tab-bouche', label: t('adv.zone.mouth') || 'Bouche', icon: 'sentiment_neutral', basePresetId: boucheP?.preset_id, subs: [ { label: t('adv.bouche.principal') || 'Bouche', avanceKey: 'bouche_adv', data: boucheP?.avance?.bouche_adv }, { label: t('adv.bouche.ext') || 'Extérieur', avanceKey: 'bouche_ext', data: boucheP?.avance?.bouche_ext }, ] },
      { id: 'tab-menton', label: t('adv.zone.chin') || 'Menton', icon: 'face_3', basePresetId: mentonP?.preset_id, subs: [ { label: t('adv.menton.principal') || 'Menton', avanceKey: 'menton_adv', data: mentonP?.avance?.menton_adv }, { label: t('adv.menton.sup') || 'Supérieur', avanceKey: 'menton_sup', data: mentonP?.avance?.menton_sup }, ] },
      { id: 'tab-machoire', label: t('adv.zone.jaw') || 'Mâchoire', icon: 'face_4', basePresetId: machoireP?.preset_id, subs: [ { label: t('adv.machoire.principal') || 'Mâchoire', avanceKey: 'machoire_adv', data: machoireP?.avance?.machoire_adv }, { label: t('adv.machoire.maxillaire') || 'Maxillaire', avanceKey: 'maxillaire', data: machoireP?.avance?.maxillaire }, { label: t('adv.machoire.mandibule') || 'Mandibule', avanceKey: 'mandibule', data: machoireP?.avance?.mandibule }, ] },
    ];

    // Build Tabs Navigation
    let tabsHtml = `<div class="flex overflow-x-auto border-b border-white/10 hide-scrollbar bg-surface-container-highest/30 shrink-0">`;
    
    // Build Content Grid
    let contentHtml = `<div class="flex-1 overflow-y-auto p-md lg:p-lg flex flex-col gap-md custom-scrollbar relative">`;

    advZones.forEach((zone, index) => {
        const isActive = index === 0;
        const tabActiveClasses = isActive 
            ? 'border-primary-container text-primary-container bg-primary-container/5' 
            : 'border-transparent text-on-surface-variant hover:text-primary-container';

        tabsHtml += `
            <button onclick="switchAdvTab('${zone.id}')" id="btn-${zone.id}" class="adv-tab-btn flex items-center gap-xs px-md py-sm border-b-[2px] ${tabActiveClasses} font-label-caps text-[11px] whitespace-nowrap transition-colors">
                <span class="material-symbols-outlined text-[16px]">${zone.icon}</span> ${zone.label}
            </button>
        `;

        const baseLabel = zone.basePresetId && zone.basePresetId !== mainPid
            ? `— base Preset ${zone.basePresetId}`
            : `— base Preset ${mainPid}`;

        let gridHtml = `
            <div id="${zone.id}" class="adv-tab-content flex-col gap-md flex-1 ${isActive ? 'flex' : 'hidden'}">
                <div class="flex items-center justify-between border-b border-primary-container/20 pb-sm mb-sm">
                    <h2 class="font-title-sm text-[16px] text-primary-container tracking-widest uppercase font-bold drop-shadow-[0_0_5px_rgba(0,240,255,0.4)]">${zone.label} ${baseLabel}</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-md flex-1">
        `;

        zone.subs.forEach(sub => {
            if (!sub.data) return;

            let slidersHtml = '';
            const sliderEntries = Object.entries(sub.data).map(([key, val]) => {
                const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
                const isModified = adjVal !== undefined && Math.abs(adjVal - val) > 1;
                const displayVal = isModified ? adjVal : val;
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
                `;
            });

            if (slidersHtml) {
                gridHtml += `
                    <div class="bg-surface/80 border border-white/5 rounded-lg p-md shadow-sm h-max">
                        <h3 class="font-label-caps text-[13px] text-on-surface mb-md opacity-90 border-l-2 border-primary-container pl-2 uppercase">${sub.label}</h3>
                        <div class="space-y-md">
                            ${slidersHtml}
                        </div>
                    </div>
                `;
            }
        });

        gridHtml += `
                </div>
                <button class="mt-md w-full max-w-[300px] mx-auto py-2 border border-primary-container/30 text-primary-container font-label-caps text-[11px] rounded hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-xs" onclick="alert('Copie globale non implémentée')">
                    <span class="material-symbols-outlined text-[16px]">copy_all</span> COPY ALL ${zone.label.toUpperCase()} SETTINGS
                </button>
            </div>
        `;
        
        contentHtml += gridHtml;
    });

    tabsHtml += `</div>`;
    contentHtml += `</div>`;

    // Export & ID Card Section
    // Construct the zone mix summary string for the card
    let recipeStr = `<span class="text-white">TÊTE (Base ${craneP?.preset_id || mainPid}):</span> `;
    if (craneP?.avance?.crane) {
        recipeStr += `Crâne[R:${craneP.avance.crane.re} A:${craneP.avance.crane.aa}] `;
    }
    recipeStr += `| <span class="text-white">FRONT (Base ${frontP?.preset_id || mainPid}):</span> ... | <span class="text-white">NEZ:</span> ...`;

    let idCardHtml = `
        <div class="border-t border-primary-container/20 bg-surface-container/90 p-md shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div class="relative bg-[#08080A] border border-primary-container p-md rounded-lg mb-md overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMC41IiBmaWxsPSIjMDBmMGZmIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')] before:opacity-20 before:pointer-events-none" id="technical-id-card">
                <div class="absolute top-0 right-0 bg-primary-container text-black font-label-caps text-[8px] px-2 py-0.5 rounded-bl-md font-bold">CONFIDENTIAL // VERIFIED</div>
                <div class="flex gap-md items-center relative z-10">
                    <div class="w-16 h-16 rounded border border-primary-container/50 overflow-hidden shrink-0">
                        <img alt="ID Card Avatar" class="w-full h-full object-cover grayscale contrast-125" src="./assets/presets/${result.preset.id}.png">
                    </div>
                    <div class="flex-1">
                        <h4 class="font-display-lg text-[16px] text-white tracking-tight leading-none mb-1 shadow-primary-container drop-shadow-md">SCANMYFACE.gg</h4>
                        <div class="text-[10px] font-label-caps text-primary-container tracking-widest mb-2 opacity-80">PRO CLUBS RECIPE - ID: ${result.preset.id}</div>
                        <p class="font-mono text-[9px] text-on-surface-variant leading-tight break-words">
                            ${recipeStr}
                        </p>
                    </div>
                </div>
            </div>
            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-sm items-center">
                <button class="flex-1 w-full py-2 bg-primary-container/10 border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span> COPY ALL TABS RECIPE
                </button>
                <button class="flex-1 w-full py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>
            </div>
        </div>
    `;

    container.innerHTML = tabsHtml + contentHtml + idCardHtml;
    console.log("Rendu Façonnage Avancé généré (Nouveau Design)");
}

// Helper JS logic to switch tabs
window.switchAdvTab = function(tabId) {
    // Reset all tabs
    document.querySelectorAll('.adv-tab-btn').forEach(btn => {
        btn.classList.remove('border-primary-container', 'text-primary-container', 'bg-primary-container/5');
        btn.classList.add('border-transparent', 'text-on-surface-variant');
    });
    // Set active tab
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-on-surface-variant');
        activeBtn.classList.add('border-primary-container', 'text-primary-container', 'bg-primary-container/5');
    }
    
    // Hide all content
    document.querySelectorAll('.adv-tab-content').forEach(content => {
        content.classList.remove('flex');
        content.classList.add('hidden');
    });
    // Show active content
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('flex');
    }
};
"""

content = content[:start_func] + new_func + content[end_idx:]

with open(js_path, 'w') as f:
    f.write(content)

print("Advanced Shaping redesign applied from code.html.")
