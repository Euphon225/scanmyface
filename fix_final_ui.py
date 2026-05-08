import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 2: ID Card text
# -------------------------------------------------------------
content = content.replace('SCANMYFACE.gg', 'SCANMYFACE.tech')

# -------------------------------------------------------------
# TASK 3: Download Button
# -------------------------------------------------------------
old_download_btn = """                <button class="flex-1 w-full py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>"""
new_download_btn = """                <button class="flex-1 w-full py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold" onclick="window.downloadIDCard()">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>"""
content = content.replace(old_download_btn, new_download_btn)

# Add window.downloadIDCard function at the end of the file
download_func = """
// Global function to download ID card using html2canvas
window.downloadIDCard = async function() {
    const card = document.getElementById('technical-id-card');
    if (!card) return;
    
    try {
        const canvas = await html2canvas(card, {
            backgroundColor: '#08080A',
            scale: 2 // High resolution
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'ScanMyFace_ID_Card.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Erreur lors de la capture de la carte ID:", err);
        alert("Une erreur est survenue lors du téléchargement.");
    }
};
"""
if "window.downloadIDCard =" not in content:
    content += download_func

# -------------------------------------------------------------
# TASK 4: Safe values for sliders
# -------------------------------------------------------------
old_map_start = "            const sliderEntries = Object.entries(sub.data).map(([key, val]) => {"
old_map_logic = """                const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
                const isModified = adjVal !== undefined && Math.abs(adjVal - val) > 1;
                const displayVal = isModified ? adjVal : val;"""

new_map_logic = """                const safeVal = val ?? 50;
                const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
                const isModified = adjVal !== undefined && Math.abs(adjVal - safeVal) > 1;
                const displayVal = isModified ? adjVal : safeVal;"""

content = content.replace(old_map_logic, new_map_logic)

# Fix the copyValue to use displayVal in string correctly? It's already doing it.

# -------------------------------------------------------------
# TASK 5: Tabs UI (gap-2)
# -------------------------------------------------------------
old_tabs_html = "    let tabsHtml = `<div class=\"flex overflow-x-auto border-b border-white/10 hide-scrollbar bg-surface-container-highest/30 shrink-0\">`;"
new_tabs_html = "    let tabsHtml = `<div class=\"flex gap-sm overflow-x-auto border-b border-white/10 hide-scrollbar bg-surface-container-highest/30 shrink-0 px-2 pt-2\">`;"
content = content.replace(old_tabs_html, new_tabs_html)

# The icons are already implemented using material-symbols-outlined

with open(js_path, 'w') as f:
    f.write(content)

print("All JS final UI fixes applied.")
