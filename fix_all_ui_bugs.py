import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 3: globalReset
# -------------------------------------------------------------
old_close_modal = r'function closeNewModal\(\) \{[\s\S]*?(?=\/\/ Override startLiveScan)'
new_close_modal = """window.globalReset = function() {
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    if (cropper) { cropper.destroy(); cropper = null; }
    if (canvasCtx) canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    if (newResultContainer) newResultContainer.innerHTML = '';
    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) laserLineNew.classList.add('hidden');
    if (newProgressInterval) clearInterval(newProgressInterval);
    if (progressPercentNew) progressPercentNew.innerText = '0%';
    if (progressBarFillNew) progressBarFillNew.style.width = '0%';
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.disabled = false;
    if (newScanActions) newScanActions.classList.remove('hidden');
};

function closeNewModal() {
    if (newScanModal) newScanModal.classList.add('hidden');
    globalReset();
}

"""
content = re.sub(old_close_modal, new_close_modal, content)

# -------------------------------------------------------------
# TASKS 1 & 2: confirmAndAnalyzeNew (timeout, cropper destroy delay, keep img visible)
# -------------------------------------------------------------
old_confirm = r'window\.confirmAndAnalyzeNew = async function\(imageDataParam\) \{[\s\S]*?(?=const originalOnResults)'
new_confirm = """window.confirmAndAnalyzeNew = async function(imageDataParam) {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");
    
    let finalDataUrl = (typeof imageDataParam === 'string') ? imageDataParam : null;
    if (!finalDataUrl && cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({ width: 512, height: 512, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
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
        
        // Task 2: Keep photo visible, replace src with cropped one
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
        
        // Task 1 & 2: Timeout, Promise refactoring, late cropper destruction
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    // Task 2: Destroy cropper only after image is safely loaded into memory
                    if (cropper) { cropper.destroy(); cropper = null; }
                    
                    outputCanvas.width = img.naturalWidth;
                    outputCanvas.height = img.naturalHeight;
                    
                    // Task 1: 5 second timeout for MediaPipe
                    let timeoutId = setTimeout(() => {
                        reject(new Error("Timeout: MediaPipe n'a pas répondu après 5 secondes."));
                    }, 5000);
                    
                    // Hook to know when originalOnResults completes
                    const tempOnResults = window.onResults || window.originalOnResults;
                    window.onResults = function(results) {
                        clearTimeout(timeoutId);
                        if (tempOnResults) tempOnResults(results);
                        resolve(); // Resolve promise here
                    };

                    await faceMesh.send({ image: img });
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Impossible de charger l\'image pour MediaPipe.'));
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

"""
content = re.sub(old_confirm, new_confirm, content)

# -------------------------------------------------------------
# TASK 4: selectPresetNew & renderAdvancedShaping
# -------------------------------------------------------------
old_select = r'window\.selectPresetNew = function\(event, presetId\) \{[\s\S]*?(?=// ==========================================)'

# Because there is no comment after selectPresetNew, let's use the end of file or regex matching the block.
# Actually I'll just use a find/replace on the exact string or regex carefully.
# Wait, let's use standard string replacement for safety, but the old selectPresetNew is long.
# I'll just inject renderAdvancedShaping and rewrite selectPresetNew.

with open(js_path, 'w') as f:
    f.write(content)
