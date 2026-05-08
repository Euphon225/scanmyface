import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# I will replace the whole window.confirmAndAnalyzeNew block
old_func = r'window\.confirmAndAnalyzeNew = async function\(\) \{[\s\S]*?(?=const originalOnResults)'

new_func = """window.confirmAndAnalyzeNew = async function() {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");
    if (!cropper) {
        console.error("Cropper est null ! L'analyse ne peut pas démarrer.");
        alert("Erreur interne: Outil de recadrage introuvable.");
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

        const croppedCanvas = cropper.getCroppedCanvas({ width: 512, height: 512, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        const finalDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
        capturedBase64 = finalDataUrl.split(',')[1];

        if (cropper) { cropper.destroy(); cropper = null; }
        inputImageNew.classList.add('hidden');

        // Launch original analysis workflow
        await runImageAnalysis(finalDataUrl, {
            onQualityFail: () => {
                if (newProgressInterval) clearInterval(newProgressInterval);
                newScanActions.classList.remove('hidden');
                newScanProgress.classList.add('hidden');
                laserLineNew.classList.add('hidden');
                btnConfirmAnalyzeNew.disabled = false;
            }
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

content = re.sub(old_func, new_func, content)

with open(js_path, 'w') as f:
    f.write(content)

print("Button logic made robust with try-catch.")
