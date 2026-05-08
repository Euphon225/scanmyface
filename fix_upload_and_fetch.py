import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# I will update handleFileUpload and confirmAndAnalyzeNew
old_handle_file_upload = r'window\.handleFileUpload = function\(e\) \{[\s\S]*?(?=let newProgressInterval)'
new_handle_file_upload = """window.handleFileUpload = function(e) {
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
    if (newResultContainer) newResultContainer.innerHTML = '';
    
    inputVideoNew.classList.add('hidden');
    inputVideoNew.style.display = 'none';
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        inputImageNew.onload = () => {
            inputImageNew.onload = null;
            initCropper(inputImageNew);
            btnConfirmAnalyzeNew.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span> VALIDER ET ANALYSER';
            
            // Attacher l'événement selon les instructions du USER
            btnConfirmAnalyzeNew.onclick = function() {
                if (cropper) {
                    let imageData = cropper.getCroppedCanvas({ width: 512, height: 512, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' }).toDataURL('image/jpeg', 0.95);
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

"""
content = re.sub(old_handle_file_upload, new_handle_file_upload, content)

old_confirm_and_analyze = r'window\.confirmAndAnalyzeNew = async function\(\) \{[\s\S]*?(?=const originalOnResults)'
new_confirm_and_analyze = """window.confirmAndAnalyzeNew = async function(imageDataParam) {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");
    
    // Si on vient du bouton de la caméra, on recadre ici
    let finalDataUrl = imageDataParam;
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

        capturedBase64 = finalDataUrl.split(',')[1];
        if (cropper) { cropper.destroy(); cropper = null; }
        inputImageNew.classList.add('hidden');

        // Appel direct au fetch de qualité (Azure/Appwrite) comme demandé par le user
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
            return; // STOP execution
        }

        console.log("Qualité OK. Lancement de l'analyse MediaPipe...");
        
        // Launch MediaPipe analysis workflow
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    outputCanvas.width = img.naturalWidth;
                    outputCanvas.height = img.naturalHeight;
                    await faceMesh.send({ image: img });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Unable to load image for analysis.'));
            img.src = finalDataUrl;
        });

    } catch(e) {
        console.error("Erreur critique dans confirmAndAnalyzeNew :", e);
        alert("Erreur lors de l'analyse de l'image.");
        if (newProgressInterval) clearInterval(newProgressInterval);
        newScanActions.classList.remove('hidden');
        newScanProgress.classList.add('hidden');
        laserLineNew.classList.add('hidden');
        btnConfirmAnalyzeNew.disabled = false;
    }
}

"""
content = re.sub(old_confirm_and_analyze, new_confirm_and_analyze, content)

with open(js_path, 'w') as f:
    f.write(content)

print("Upload and confirm functions updated to match requested logic.")
