import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# I will replace confirmAndAnalyzeNew with one that has logs
old_func = """async function confirmAndAnalyzeNew() {
    if (!cropper) return;

    btnConfirmAnalyzeNew.disabled = true;
"""

new_func = """window.confirmAndAnalyzeNew = async function() {
    console.log("confirmAndAnalyzeNew TRIGGÉRED !");
    if (!cropper) {
        console.error("Cropper est null ! L'analyse ne peut pas démarrer.");
        alert("Erreur interne: Outil de recadrage introuvable.");
        return;
    }

    btnConfirmAnalyzeNew.disabled = true;
"""

if "async function confirmAndAnalyzeNew() {" in content:
    content = content.replace(old_func, new_func)

# Also update the assignments to use window.confirmAndAnalyzeNew
content = content.replace("btnConfirmAnalyzeNew.onclick = confirmAndAnalyzeNew;", "btnConfirmAnalyzeNew.onclick = window.confirmAndAnalyzeNew;")

with open(js_path, 'w') as f:
    f.write(content)

print("Button logic updated.")
