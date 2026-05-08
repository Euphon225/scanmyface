import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# Make sure we don't duplicate. If NEW MODAL UI FLOW is already there, we strip it out.
if "// ==========================================" in content and "// NEW MODAL UI FLOW" in content:
    content = content[:content.find("// ==========================================\n// NEW MODAL UI FLOW")]

new_funcs = """// ==========================================
// NEW MODAL UI FLOW
// ==========================================
let newScanModal, inputVideoNew, inputImageNew, btnConfirmAnalyzeNew, newScanProgress, progressPercentNew, progressBarFillNew, newScanActions, newResultContainer, laserLineNew, btnBackModal, btnCloseModal;

document.addEventListener('DOMContentLoaded', () => {
    // --- NEW MODAL DOM ASSIGNMENTS ---
    newScanModal = document.getElementById('new-scan-modal');
    inputVideoNew = document.getElementById('input-video-new');
    inputImageNew = document.getElementById('input-image-new');
    btnConfirmAnalyzeNew = document.getElementById('btn-confirm-analyze-new');
    newScanProgress = document.getElementById('new-scan-progress');
    progressPercentNew = document.getElementById('progress-percent-new');
    progressBarFillNew = document.getElementById('progress-bar-fill-new');
    newScanActions = document.getElementById('new-scan-actions');
    newResultContainer = document.getElementById('new-result-container');
    laserLineNew = document.getElementById('laser-line-new');
    btnBackModal = document.getElementById('btn-back-modal');
    btnCloseModal = document.getElementById('btn-close-modal');

    if (btnBackModal) btnBackModal.addEventListener('click', window.globalReset);
    if (btnCloseModal) btnCloseModal.addEventListener('click', window.globalReset);
});

window.globalReset = function() {
    if (newScanModal) newScanModal.classList.add('hidden');
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    if (newResultContainer) newResultContainer.innerHTML = '';
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) laserLineNew.classList.add('hidden');
    if (newProgressInterval) clearInterval(newProgressInterval);
    if (progressPercentNew) progressPercentNew.innerText = '0%';
    if (progressBarFillNew) progressBarFillNew.style.width = '0%';
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.disabled = false;
    if (newScanActions) newScanActions.classList.remove('hidden');
    
    // Hide advanced container if it exists
    const adv = document.getElementById('new-advanced-container');
    if (adv) adv.classList.add('hidden');
};

// Override startLiveScan
window.startLiveScan = async function() {
    newScanModal.classList.remove('hidden');
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    newResultContainer.innerHTML = '';
    
    inputVideoNew.classList.remove('hidden');
    inputVideoNew.style.display = 'block';
    inputImageNew.classList.add('hidden');

    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        inputVideoNew.srcObject = stream;
        window.localStream = stream;
        
        btnConfirmAnalyzeNew.innerHTML = '<span class="material-symbols-outlined text-[16px]">camera</span> CAPTURE';
        btnConfirmAnalyzeNew.onclick = capturePhotoNew;
    } catch (error) {
        console.error("Camera error:", error);
        alert(t('camera.error') || 'Erreur caméra');
    }
};

function capturePhotoNew() {
    if (!window.localStream) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = inputVideoNew.videoWidth;
    canvas.height = inputVideoNew.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(inputVideoNew, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    window.localStream.getTracks().forEach(track => track.stop());
    window.localStream = null;
    inputVideoNew.classList.add('hidden');
    
    inputImageNew.onload = () => {
        inputImageNew.onload = null;
        initCropper(inputImageNew);
    };
    inputImageNew.src = dataUrl;
    inputImageNew.classList.remove('hidden');
    
    btnConfirmAnalyzeNew.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> VALIDER ET ANALYSER';
    btnConfirmAnalyzeNew.onclick = function() {
        if (cropper) {
            let imageData = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' }).toDataURL('image/jpeg', 0.95);
            window.confirmAndAnalyzeNew(imageData);
        }
    };
}

// Override handleFileUpload
window.handleFileUpload = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    newScanModal.classList.remove('hidden');
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    newResultContainer.innerHTML = '';
    
    inputVideoNew.classList.add('hidden');
    inputVideoNew.style.display = 'none';
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        inputImageNew.onload = () => {
            inputImageNew.onload = null;
            initCropper(inputImageNew);
            btnConfirmAnalyzeNew.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> VALIDER ET ANALYSER';
            btnConfirmAnalyzeNew.onclick = function() {
                if (cropper) {
                    let imageData = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' }).toDataURL('image/jpeg', 0.95);
                    window.confirmAndAnalyzeNew(imageData);
                }
            };
        };
        inputImageNew.src = dataUrl;
        inputImageNew.classList.remove('hidden');
        inputImageNew.removeAttribute('hidden');
    };
    reader.readAsDataURL(file);
};

let newProgressInterval = null;

window.confirmAndAnalyzeNew = async function(imageDataParam) {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");
    
    let finalDataUrl = (typeof imageDataParam === 'string') ? imageDataParam : null;
    if (!finalDataUrl && cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        finalDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
    }

    if (!finalDataUrl) {
        console.error("Aucune image à analyser.");
        return;
    }

    try {
        btnConfirmAnalyzeNew.disabled = true;
        newScanActions.classList.add('hidden');
        
        newScanProgress.classList.remove('hidden');
        laserLineNew.classList.remove('hidden');
        laserLineNew.classList.add('animate-pulse');
        progressPercentNew.innerText = '0%';
        progressBarFillNew.style.width = '0%';
        
        let progress = 0;
        if (newProgressInterval) clearInterval(newProgressInterval);
        newProgressInterval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress > 90) progress = 90;
            progressPercentNew.innerText = progress + '%';
            progressBarFillNew.style.width = progress + '%';
        }, 300);

        capturedBase64 = finalDataUrl.split(',')[1];
        
        inputImageNew.onload = null;
        inputImageNew.src = finalDataUrl;
        inputImageNew.classList.remove('hidden');

        console.log("Verification de la qualité de la photo...");
        const quality = await checkPhotoQuality(capturedBase64);
        
        if (!quality.ok) {
            console.warn("Quality Check Failed:", quality.reason);
            clearInterval(newProgressInterval);
            newScanActions.classList.remove('hidden');
            newScanProgress.classList.add('hidden');
            laserLineNew.classList.add('hidden');
            btnConfirmAnalyzeNew.disabled = false;
            
            if (quality.reason === 'no_face') alert(t('qa.noface'));
            else if (quality.reason === 'too_blurry') alert(t('qa.blur'));
            else if (quality.reason === 'bad_lighting') alert(t('qa.light'));
            else if (quality.reason === 'bad_angle') alert(t('qa.angle'));
            else alert("Erreur de qualité d'image.");
            return; 
        }

        console.log("Qualité OK. Lancement de l'analyse MediaPipe...");
        
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    if (cropper) { cropper.destroy(); cropper = null; }
                    outputCanvas.width = img.naturalWidth;
                    outputCanvas.height = img.naturalHeight;
                    
                    await faceMesh.send({ image: img });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Impossible de charger l'image pour MediaPipe."));
            img.src = finalDataUrl;
        });

    } catch(e) {
        console.error("Erreur critique dans confirmAndAnalyzeNew :", e);
        alert(e.message || "Erreur lors de l'analyse de l'image.");
        if (newProgressInterval) clearInterval(newProgressInterval);
        newScanActions.classList.remove('hidden');
        newScanProgress.classList.add('hidden');
        laserLineNew.classList.add('hidden');
        btnConfirmAnalyzeNew.disabled = false;
    }
}

// Intercept onResults to finish the progress bar
const originalOnResults = window.onResults || onResults;
window.onResults = function(results) {
    originalOnResults(results);
};

// Override showPresetChoiceScreen
window.showPresetChoiceScreen = function(top3) {
    console.log("New showPresetChoiceScreen called with", top3);
    
    if (newProgressInterval) clearInterval(newProgressInterval);
    if (progressPercentNew) progressPercentNew.innerText = '100%';
    if (progressBarFillNew) progressBarFillNew.style.width = '100%';
    if (laserLineNew) {
        laserLineNew.classList.remove('animate-pulse');
        laserLineNew.classList.add('hidden');
    }
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.disabled = false;

    state.pendingTop3 = top3;
    if (newResultContainer) newResultContainer.innerHTML = '';
    
    const styles = [
        { border: 'border-tertiary-container', shadow: 'shadow-[0_0_15px_rgba(254,214,57,0.3)]', glow: 'bg-tertiary-container', text: 'text-tertiary-container', label: '★ TOP MATCH' },
        { border: 'border-white/10 hover:border-primary-container/60', shadow: '', glow: 'bg-primary-container opacity-80', text: 'text-primary-container', label: '' },
        { border: 'border-white/10 hover:border-primary-container/60', shadow: '', glow: 'bg-primary-container opacity-60', text: 'text-primary-container', label: '' }
    ];

    top3.forEach((entry, index) => {
        const player = entry?.player ?? entry?.preset ?? entry;
        const presetId = player?.preset_id ?? player?.presetId ?? player?.id ?? null;
        const playerName = player?.name ?? player?.label ?? player?.preset_name ?? `Preset ${presetId ?? ''}`;
        const scoreValue = Number(entry?.score ?? player?.score ?? 0);
        const scorePercent = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, Math.round(scoreValue))) : 0;
        const imageSrc = getPresetImageSrc(player);
        
        const style = styles[index] || styles[2];
        
        const labelHtml = index === 0 ? `<div class="absolute top-0 right-0 ${style.glow} text-[#0A0A0C] font-label-caps text-[9px] px-sm py-[2px] rounded-bl-lg font-bold shadow-[0_0_10px_rgba(254,214,57,0.5)] z-10">${style.label}</div>` : '';
        
        const cardHtml = `
            <div class="relative bg-surface-container-lowest border ${style.border} ${style.shadow} transition-colors rounded-lg p-md flex gap-lg items-center overflow-hidden group">
                ${labelHtml}
                <div class="w-[70px] h-[90px] rounded border border-white/10 shrink-0 relative overflow-hidden bg-black">
                    <img src="${imageSrc}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22 viewBox=%220 0 400 500%22%3E%3Crect width=%22400%22 height=%22500%22 fill=%22%23161a1f%22/%3E%3C/svg%3E';this.style.opacity='0.3'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div class="flex flex-col flex-1">
                    <div class="flex items-center justify-between mb-xs">
                        <span class="font-title-sm text-[15px] text-on-surface font-bold uppercase">${playerName}</span>
                        <span class="font-title-sm text-[15px] ${style.text} font-bold">${scorePercent}%</span>
                    </div>
                    <div class="w-full h-[2px] bg-white/10 rounded-full mb-md">
                        <div class="h-full ${style.glow}" style="width: ${scorePercent}%"></div>
                    </div>
                    <button class="w-full py-xs border ${index === 0 ? 'border-tertiary-container text-tertiary-container hover:bg-tertiary-container/10' : 'border-white/10 text-on-surface-variant group-hover:border-primary-container group-hover:text-primary-container'} font-label-caps text-[11px] transition-colors rounded" onclick="window.selectPresetNew(event, '${presetId}')">
                        CHOISIR
                    </button>
                </div>
            </div>
        `;
        
        if(newResultContainer) newResultContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
};

window.selectPresetNew = function(event, presetId) {
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
    
    container.innerHTML = '';
    
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

    const mainPresetObj = PRESETS_DB.find(p => p.preset_id === result.preset.id);
    let zoneMix = null;
    if (mainPresetObj) {
      zoneMix = computeZoneMix(result.ratios, mainPresetObj, PRESETS_DB);
      container.appendChild(renderZoneMix(zoneMix));
    }

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
            <div class="accordion-content" style="padding: 10px;">
              ${subsHtml}
            </div>
          `;
          advAccordion.appendChild(item);
        });

        container.appendChild(advAccordion);
    }
    console.log("Rendu Façonnage Avancé généré");
};
"""

content += new_funcs

with open(js_path, 'w') as f:
    f.write(content)

print("Perfect UI Script Injected.")
