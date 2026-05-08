import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

old_capture = r'btnConfirmAnalyzeNew\.onclick = confirmAndAnalyzeNew;'
new_capture = """btnConfirmAnalyzeNew.onclick = function() {
        if (cropper) {
            let imageData = cropper.getCroppedCanvas({ width: 512, height: 512, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' }).toDataURL('image/jpeg', 0.95);
            window.confirmAndAnalyzeNew(imageData);
        }
    };"""

# Replace all occurrences of the old onclick assignment
content = re.sub(old_capture, new_capture, content)

with open(js_path, 'w') as f:
    f.write(content)

print("capturePhotoNew updated.")
