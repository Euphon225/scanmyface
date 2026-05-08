import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# Fix Bug 1: Type check for imageDataParam
old_param_check = """    let finalDataUrl = imageDataParam;
    if (!finalDataUrl && cropper) {"""
new_param_check = """    let finalDataUrl = (typeof imageDataParam === 'string') ? imageDataParam : null;
    if (!finalDataUrl && cropper) {"""
content = content.replace(old_param_check, new_param_check)

# Fix Bug 2: Keep inputImageNew visible
old_hide = """        if (cropper) { cropper.destroy(); cropper = null; }
        inputImageNew.classList.add('hidden');"""
new_hide = """        if (cropper) { cropper.destroy(); cropper = null; }
        // On ne cache pas l'image pour qu'elle reste visible à gauche"""
content = content.replace(old_hide, new_hide)

with open(js_path, 'w') as f:
    f.write(content)

print("Bugs 1 and 2 fixed.")
