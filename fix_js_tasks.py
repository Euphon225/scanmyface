import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 2: BACK button logic
# -------------------------------------------------------------
# Replace the old event listener assignment
old_listener = r"if \(btnBackModal\) btnBackModal\.addEventListener\('click', window\.globalReset\);"
new_listener = """if (btnBackModal) btnBackModal.addEventListener('click', window.handleBackAction);"""
content = re.sub(old_listener, new_listener, content)

# Inject window.handleBackAction before globalReset
new_back_action = """window.handleBackAction = function() {
    // 1. Check if we are in the Advanced Accordion view
    const advView = document.getElementById('advanced-shaping-view');
    if (advView && !advView.classList.contains('hidden')) {
        // Go back to Zone Mix view
        advView.classList.add('hidden');
        advView.style.display = 'none';
        document.getElementById('zone-mix-view').classList.remove('hidden');
        const headerTitle = document.querySelector('#new-scan-modal h2');
        if (headerTitle) headerTitle.innerText = "FAÇONNAGE AVANCÉ";
        return;
    }
    
    // 2. Check if we are in the Zone Mix view
    const zoneMixView = document.getElementById('zone-mix-view');
    if (zoneMixView && !zoneMixView.classList.contains('hidden')) {
        // Go back to Top 3 Matches
        if (inputImageNew) {
            if (typeof capturedBase64 !== 'undefined' && capturedBase64) {
                inputImageNew.src = 'data:image/jpeg;base64,' + capturedBase64;
            }
            inputImageNew.classList.add('mix-blend-luminosity', 'opacity-70');
        }
        const scanLabel = document.querySelector('#new-scan-modal .font-label-caps.text-primary-container');
        if (scanLabel) {
            scanLabel.innerText = 'SCANNING';
            scanLabel.style.color = '#00f0ff';
        }
        
        var faceGuide = document.getElementById('face-guide-overlay');
        if (faceGuide) faceGuide.classList.remove('hidden');
        document.querySelectorAll('.scan-corners').forEach(c => c.classList.remove('hidden'));
        
        if (typeof state !== 'undefined' && state.pendingTop3) {
            window.showPresetChoiceScreen(state.pendingTop3);
        }
        return;
    }
    
    // Default: Close modal completely
    window.globalReset();
};

window.globalReset = """
content = content.replace('window.globalReset = ', new_back_action)

# -------------------------------------------------------------
# TASK 4: Remove emojis in advZones and accordion HTML
# -------------------------------------------------------------
# Find advZones declaration in generateAdvancedAccordion and remove the emojis
content = content.replace("icon: '👤'", "icon: ''")
content = content.replace("icon: '🗣️'", "icon: ''")
content = content.replace("icon: '👁️'", "icon: ''")
content = content.replace("icon: '👃'", "icon: ''")
content = content.replace("icon: '😊'", "icon: ''")
content = content.replace("icon: '👄'", "icon: ''")
content = content.replace("icon: '🫦'", "icon: ''")
content = content.replace("icon: '💪'", "icon: ''")

# Also in the HTML generation:
# <span class="font-title-sm text-[14px] text-on-surface font-bold uppercase">${zone.icon} ${zone.label}${zoneModBadge}${baseLabel}</span>
# Make sure empty icon doesn't leave a weird space
content = content.replace("${zone.icon} ${zone.label}", "${zone.label}")


with open(js_path, 'w') as f:
    f.write(content)

print("JS UI tasks 2 and 4 applied.")
