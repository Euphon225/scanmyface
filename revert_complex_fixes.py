import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# FIX 1 & 2: confirmAndAnalyzeNew 
# -------------------------------------------------------------
old_confirm_regex = r'window\.confirmAndAnalyzeNew = async function\(imageDataParam\) \{[\s\S]*?(?=window\.selectPresetNew)'

new_confirm = """window.confirmAndAnalyzeNew = async function(imageDataParam) {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");
    
    let finalDataUrl = (typeof imageDataParam === 'string') ? imageDataParam : null;
    if (!finalDataUrl && cropper) {
        // Fix 2: Remove strict 512x512 constraints
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
        
        // Fix 2: Prevent infinite loop by clearing onload before setting src
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
        
        // Fix 1: Remove custom promise/timeout wrapper and hook hack
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                try {
                    if (cropper) { cropper.destroy(); cropper = null; }
                    outputCanvas.width = img.naturalWidth;
                    outputCanvas.height = img.naturalHeight;
                    
                    // Simple, clean MediaPipe call without blocking logic
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

"""
content = re.sub(old_confirm_regex, new_confirm, content)


# -------------------------------------------------------------
# FIX 3: renderAdvancedShaping display: none removal
# -------------------------------------------------------------
# Find the exact line defining accordion-content in renderAdvancedShaping
# The old line is:
# <div class="accordion-content" style="padding: 10px; display: none;">
old_accordion = r'<div class="accordion-content" style="padding: 10px; display: none;">'
new_accordion = r'<div class="accordion-content" style="padding: 10px;">'
content = re.sub(old_accordion, new_accordion, content)

# Add the console log at the end of the function
# The function ends with:
#         container.appendChild(advAccordion);
#     }
# };
old_end = """        container.appendChild(advAccordion);
    }
};"""
new_end = """        container.appendChild(advAccordion);
    }
    console.log("Rendu Façonnage Avancé généré");
};"""
content = content.replace(old_end, new_end)

with open(js_path, 'w') as f:
    f.write(content)

print("Fixes applied successfully.")
