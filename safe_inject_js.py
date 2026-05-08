import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# 1. Add new selectors at the top
new_selectors = """
// --- NEW MODAL SELECTORS ---
let newScanModal, inputVideoNew, inputImageNew, btnConfirmAnalyzeNew, newScanProgress, progressPercentNew, progressBarFillNew, newScanActions, newResultContainer, laserLineNew, btnBackModal, btnCloseModal;
"""
if "NEW MODAL SELECTORS" not in content:
    content = content.replace("let btnCamera, btnCapture, btnAnalyzeUpload,", new_selectors + "\nlet btnCamera, btnCapture, btnAnalyzeUpload,")

# 2. Add assignments in DOMContentLoaded
new_assignments = """
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

    if (btnBackModal) btnBackModal.addEventListener('click', closeNewModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeNewModal);
"""
if "NEW MODAL DOM ASSIGNMENTS" not in content:
    content = content.replace("    btnCamera = document.getElementById('btn-camera');", new_assignments + "\n    btnCamera = document.getElementById('btn-camera');")

# 3. OVERRIDE EVENT LISTENERS TO USE NEW FUNCS
# The old listeners are:
# if (btnCamera) btnCamera.addEventListener('click', () => { if (typeof startLiveScan === 'function') startLiveScan(); });
# if (fileUpload) fileUpload.addEventListener('change', (e) => { if (typeof handleFileUpload === 'function') handleFileUpload(e); });
# I will just add the new code to the bottom and override the old functions directly!

new_funcs = """

// ==========================================
// NEW MODAL UI FLOW
// ==========================================

function closeNewModal() {
    if (newScanModal) newScanModal.classList.add('hidden');
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
}

// Override startLiveScan
window.startLiveScan = function() {
    console.log('Button Clicked: btnCamera (New UI)');
    capturedBase64 = null;
    capturedCanvas = null;
    if (cropper) { cropper.destroy(); cropper = null; }
    if(canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    newScanModal.classList.remove('hidden');
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    newResultContainer.innerHTML = '';
    
    inputVideoNew.classList.remove('hidden');
    inputVideoNew.removeAttribute('hidden');
    inputVideoNew.style.display = 'block';
    inputImageNew.classList.add('hidden');
    
    btnConfirmAnalyzeNew.innerHTML = '<span class="material-symbols-outlined text-[16px]">camera</span> CAPTURE';
    btnConfirmAnalyzeNew.onclick = capturePhotoNew;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then(function(stream) {
            window.localStream = stream;
            inputVideoNew.srcObject = stream;
            inputVideoNew.muted = true;
            inputVideoNew.play().catch(e => console.error("Erreur play:", e));
        })
        .catch(function(error) {
            console.error("Erreur caméra:", error);
            alert("Erreur: Impossible d'accéder à la caméra.");
        });
    } else {
        alert("La caméra n'est pas supportée sur ce navigateur.");
    }
};

function capturePhotoNew() {
    capturedCanvas = document.createElement('canvas');
    capturedCanvas.width  = inputVideoNew.videoWidth;
    capturedCanvas.height = inputVideoNew.videoHeight;
    const ctx = capturedCanvas.getContext('2d');
    
    ctx.translate(capturedCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(inputVideoNew, 0, 0, capturedCanvas.width, capturedCanvas.height);
    
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    
    const dataUrl = capturedCanvas.toDataURL('image/jpeg', 0.95);
    capturedBase64 = dataUrl.split(',')[1];

    inputImageNew.onload = () => {
        initCropper(inputImageNew);
        inputImageNew.onload = null;
    };
    inputImageNew.src = dataUrl;
    inputImageNew.classList.remove('hidden');
    inputImageNew.removeAttribute('hidden');
    inputVideoNew.classList.add('hidden');
    inputVideoNew.style.display = 'none';
    
    btnConfirmAnalyzeNew.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> VALIDER ET ANALYSER';
    btnConfirmAnalyzeNew.onclick = confirmAndAnalyzeNew;
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
            btnConfirmAnalyzeNew.onclick = confirmAndAnalyzeNew;
        };
        inputImageNew.src = dataUrl;
        inputImageNew.classList.remove('hidden');
        inputImageNew.removeAttribute('hidden');
    };
    reader.readAsDataURL(file);
};

// Start the progress bar animation globally so we can stop it inside onResults
let newProgressInterval = null;

async function confirmAndAnalyzeNew() {
    if (!cropper) return;

    btnConfirmAnalyzeNew.disabled = true;
    newScanActions.classList.add('hidden');
    
    // Show Progress
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

    const croppedCanvas = cropper.getCroppedCanvas({ width: 512, height: 512, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
    const finalDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
    capturedBase64 = finalDataUrl.split(',')[1];

    if (cropper) { cropper.destroy(); cropper = null; }
    inputImageNew.classList.add('hidden');

    // Launch original analysis workflow
    await runImageAnalysis(finalDataUrl, {
        onQualityFail: () => {
            clearInterval(newProgressInterval);
            newScanActions.classList.remove('hidden');
            newScanProgress.classList.add('hidden');
            laserLineNew.classList.add('hidden');
            btnConfirmAnalyzeNew.disabled = false;
        }
    });
}

// Intercept onResults to finish the progress bar
const originalOnResults = window.onResults || onResults;
window.onResults = function(results) {
    // Call the original MediaPipe callback to draw and fetch Azure data
    originalOnResults(results);
    
    // Note: The original onResults calls showPresetChoiceScreen(top3) when Azure data returns!
    // So we just let it do that, and override showPresetChoiceScreen.
};

// Override showPresetChoiceScreen
window.showPresetChoiceScreen = function(top3) {
    console.log("New showPresetChoiceScreen called with", top3);
    
    // Stop progress bar animation
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
                    <button class="w-full py-xs border ${index === 0 ? 'border-tertiary-container text-tertiary-container hover:bg-tertiary-container/10' : 'border-white/10 text-on-surface-variant group-hover:border-primary-container group-hover:text-primary-container'} font-label-caps text-[11px] transition-colors rounded" onclick="selectPresetNew('${presetId}')">
                        CHOISIR
                    </button>
                </div>
            </div>
        `;
        
        if(newResultContainer) newResultContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
};

window.selectPresetNew = function(presetId) {
    closeNewModal();
    // Use the original selectPreset function which sets state and navigates to screen-results
    selectPreset(presetId);
};

"""
if "NEW MODAL UI FLOW" not in content:
    content += new_funcs

with open(js_path, 'w') as f:
    f.write(content)

print("Safely injected new UI overrides without deleting original AI logic.")
