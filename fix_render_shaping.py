import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 2 & 3: Restore colors, hide guides
# -------------------------------------------------------------
old_img = """    // 1. Colonne de Gauche (Image du Preset)
    if (inputImageNew) {
        inputImageNew.src = `./assets/presets/${result.preset.id}.png`;
        inputImageNew.classList.remove('hidden');
    }"""
new_img = """    // 1. Colonne de Gauche (Image du Preset)
    if (inputImageNew) {
        inputImageNew.src = `./assets/presets/${result.preset.id}.png`;
        // Task 2: Restore full colors
        inputImageNew.classList.remove('hidden', 'mix-blend-luminosity', 'opacity-70', 'grayscale');
    }
    
    // Task 3: Masquer le Guide Visuel (Ovale & Angles)
    const faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) faceGuide.classList.add('hidden');
    document.querySelectorAll('.scan-corners').forEach(c => c.classList.add('hidden'));"""
content = content.replace(old_img, new_img)


# -------------------------------------------------------------
# TASK 4: Add Tutorial Text
# -------------------------------------------------------------
old_text = """        <div id="zone-mix-view" class="flex flex-col gap-md">
            <div style="margin-bottom: 8px;">
                <h3 class="font-title-sm text-title-sm text-on-surface uppercase tracking-tight">Zone Mix</h3>
                <p class="font-body-md text-[14px] text-on-surface-variant">L'IA a composé ce visage avec les presets suivants.</p>
            </div>"""

new_text = """        <div id="zone-mix-view" class="flex flex-col gap-md">
            <div style="margin-bottom: 24px;">
                <h3 class="font-title-sm text-title-sm text-on-surface uppercase tracking-tight" style="color: #00f0ff; margin-bottom: 8px;">ÉTAPE 2 — ONGLET TÊTE (MIX DE PRESETS)</h3>
                <p class="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                    Dans EA FC 26, rends-toi dans l'onglet "Tête". Pour chaque zone du visage listée ci-dessous, sélectionne le numéro de modèle exact. C'est ce mix unique qui crée l'ADN de base de ton visage avant l'ajustement des curseurs.
                </p>
            </div>"""
content = content.replace(old_text, new_text)

# Ensure the visual guides and styles are reset on new scan
old_reset = r'if \(newScanProgress\) newScanProgress\.classList\.add\(\'hidden\'\);'
new_reset = """if (newScanProgress) newScanProgress.classList.add('hidden');
    const faceGuide = document.getElementById('face-guide-overlay');
    if (faceGuide) faceGuide.classList.remove('hidden');
    document.querySelectorAll('.scan-corners').forEach(c => c.classList.remove('hidden'));
    if (inputImageNew) {
        inputImageNew.classList.add('mix-blend-luminosity', 'opacity-70');
    }"""
content = re.sub(old_reset, new_reset, content)

with open(js_path, 'w') as f:
    f.write(content)

print("Advanced Shaping UI Updates applied.")
