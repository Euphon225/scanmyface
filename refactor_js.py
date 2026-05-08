import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# 1. Add new selectors
new_selectors = """
// --- NEW MODAL SELECTORS ---
let newScanModal, inputVideoNew, inputImageNew, btnConfirmAnalyzeNew, newScanProgress, progressPercentNew, progressBarFillNew, newScanActions, newResultContainer, laserLineNew, btnBackModal, btnCloseModal;
"""

# Find where selectors are declared and add new ones
if "NEW MODAL SELECTORS" not in content:
    content = content.replace("let btnCamera, btnCapture, btnAnalyzeUpload,", new_selectors + "\nlet btnCamera, btnCapture, btnAnalyzeUpload,")

# Add assignments in DOMContentLoaded
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

    // Modal listeners
    if (btnBackModal) btnBackModal.addEventListener('click', closeNewModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeNewModal);
    if (btnConfirmAnalyzeNew) btnConfirmAnalyzeNew.addEventListener('click', () => { if (typeof confirmAndAnalyzeNew === 'function') confirmAndAnalyzeNew(); });
"""

if "NEW MODAL DOM ASSIGNMENTS" not in content:
    content = content.replace("    btnCamera = document.getElementById('btn-camera');", new_assignments + "\n    btnCamera = document.getElementById('btn-camera');")

# 2. Add Modal Close Function
modal_close_func = """
function closeNewModal() {
    newScanModal.classList.add('hidden');
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
        window.localStream = null;
    }
    if (cropper) { cropper.destroy(); cropper = null; }
}
"""
if "function closeNewModal()" not in content:
    content = content.replace("function startLiveScan() {", modal_close_func + "\nfunction startLiveScan() {")


# 3. Update startLiveScan
# It should open the new modal and use inputVideoNew
old_live_scan = """
    inputVideo.classList.remove('hidden');
    inputVideo.removeAttribute('hidden');
    inputVideo.style.display = 'block';
    btnAnalyzeUpload.classList.add('hidden');
    btnCapture.classList.remove('hidden');

    navigateTo('screen-scan');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then(function(stream) {
            window.localStream = stream;
            inputVideo.srcObject = stream;
            inputVideo.muted = true;
            inputVideo.play().catch(e => console.error("Erreur play:", e));
"""
new_live_scan = """
    // Use new modal instead of screen-scan
    newScanModal.classList.remove('hidden');
    newScanActions.classList.remove('hidden');
    newScanProgress.classList.add('hidden');
    laserLineNew.classList.add('hidden');
    newResultContainer.innerHTML = '';
    
    // Switch cropper input elements to new UI
    inputVideoNew.classList.remove('hidden');
    inputVideoNew.removeAttribute('hidden');
    inputVideoNew.style.display = 'block';
    inputImageNew.classList.add('hidden');
    
    // We auto-capture the first frame immediately for cropper in the new flow since there is no separate "Capture" button
    // The user wants to crop right away. Wait, if it's a camera feed, how do they crop?
    // In old flow, they clicked "Capture" to freeze.
    // Let's keep the camera feed, but wait, the prompt says "Le bouton principal en bas du cadre doit indiquer 'Valider et Analyser'".
    // This implies they see the image to crop. If it's a live camera, they can't crop a moving video.
    // They must capture first. But the user removed the Capture button.
    // Solution: When camera starts, let's take a snapshot after 2 seconds OR show a Capture button.
    // "Étape 2 (Recadrage/Crop - NOUVEAU) : L'application bascule sur le nouveau design... L'image capturée ou uploadée s'affiche"
    // Okay, so we should capture automatically or keep a capture button. 
    // Let's modify the new UI to have a Capture button that turns into "Valider et Analyser".
"""
# I will use a different approach. Since it's complex, I'll write the logic entirely.
with open(js_path, 'w') as f:
    f.write(content)
print("DOM setup done. Need to rewrite functions.")
