import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# Inside renderAdvancedShaping, there is an erroneous block:
erroneous_block = """    if (newScanProgress) newScanProgress.classList.add('hidden');
    var faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) faceGuide.classList.remove('hidden');
    document.querySelectorAll('.scan-corners').forEach(c => c.classList.remove('hidden'));
    if (inputImageNew) {
        inputImageNew.classList.add('mix-blend-luminosity', 'opacity-70');
    }
    if (laserLineNew) {"""

fixed_block = """    if (newScanProgress) newScanProgress.classList.add('hidden');
    if (laserLineNew) {"""

content = content.replace(erroneous_block, fixed_block)

with open(js_path, 'w') as f:
    f.write(content)

print("Removed erroneous unhide block inside renderAdvancedShaping.")
