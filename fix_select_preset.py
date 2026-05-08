import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

old_select_preset = r'window\.selectPresetNew = function\(presetId\) \{[\s\S]*?\};'
new_select_preset = """window.selectPresetNew = function(event, presetId) {
    if (event) event.preventDefault();
    
    // Instead of closeNewModal() and selectPreset(), we render inline
    if (!state.pendingAnalysis) return;
    const { landmarks, skinTone, skinMeta, scores } = state.pendingAnalysis;
    const chosenPreset = PRESETS_DB.find(p => p.preset_id === presetId);
    if (!chosenPreset) return;

    state.results = analyzeWithPreset(landmarks, skinTone, chosenPreset, scores);
    state.results.skinMeta = skinMeta;
    
    // Hide Top Matches UI
    const matchesContainer = document.getElementById('new-result-container');
    if (matchesContainer) matchesContainer.classList.add('hidden');
    
    // Update Header Text
    const headerTitle = document.querySelector('#new-scan-modal h2');
    if (headerTitle) headerTitle.innerText = "FAÇONNAGE AVANCÉ";
    
    const headerTextElements = document.querySelectorAll('#new-scan-modal p');
    headerTextElements.forEach(p => {
        if (p.innerText.includes("L'IA a trouvé")) {
            p.innerText = "Ajuste les curseurs pour correspondre parfaitement au preset.";
        }
    });
    
    // Show advanced UI container
    let advContainer = document.getElementById('new-advanced-container');
    if (!advContainer) {
        advContainer = document.createElement('div');
        advContainer.id = 'new-advanced-container';
        advContainer.className = 'flex-col gap-md flex-1 overflow-y-auto pr-sm results-container';
        advContainer.style = 'display: flex; flex-direction: column; gap: 16px; flex: 1; overflow-y: auto;';
        if (matchesContainer && matchesContainer.parentNode) {
            matchesContainer.parentNode.appendChild(advContainer);
        }
    }
    advContainer.innerHTML = '';
    advContainer.classList.remove('hidden');

    // Hack querySelector to redirect renderResults to our new container
    const origQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        if (selector === '.results-container') return advContainer;
        return origQuerySelector.call(document, selector);
    };

    renderResults();

    document.querySelector = origQuerySelector; // restore
};"""

content = re.sub(old_select_preset, new_select_preset, content)

# I also need to update where selectPresetNew is called in showPresetChoiceScreen to pass the event
old_onclick = r'onclick="selectPresetNew\(\'\$\{presetId\}\'\)"'
new_onclick = r'onclick="window.selectPresetNew(event, \'${presetId}\')"'
content = re.sub(old_onclick, new_onclick, content)

with open(js_path, 'w') as f:
    f.write(content)

print("selectPresetNew updated.")
