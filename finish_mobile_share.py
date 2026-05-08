import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# I will replace the generation of idCardHtml and shareResults in script.js
# First, let's locate the place where we build the idCardHtml.
old_recipe_start = "    // Construct the zone mix summary string for the card"
old_recipe_end = "    container.innerHTML = tabsHtml + contentHtml + idCardHtml;"

new_recipe_logic = """    // Construct the zone mix summary string for the card
    let zoneMixArr = [];
    advZones.forEach(z => {
        if (z.id !== 'tab-crane' && z.basePresetId && z.basePresetId !== mainPid) {
            zoneMixArr.push(`<span class="text-white">${z.label.toUpperCase()}:</span> ${z.basePresetId}`);
        }
    });
    let zoneMixStr = zoneMixArr.length > 0 ? zoneMixArr.join(' | ') : 'MODÈLE PUR (Aucun mix)';

    let modSlidersArr = [];
    advZones.forEach(z => {
        z.subs.forEach(sub => {
            if (!sub.data) return;
            Object.entries(sub.data).forEach(([key, val]) => {
                const safeVal = val ?? 50;
                const adjVal = sub.noAdjust ? undefined : result.adjustments?.avance?.[sub.avanceKey]?.[key];
                const isModified = adjVal !== undefined && Math.abs(adjVal - safeVal) > 1;
                if (isModified) {
                    const labelName = keyLabels[key] || key;
                    modSlidersArr.push(`<span class="text-primary-container">${sub.label.substring(0,5).toUpperCase()}:</span> ${labelName} ${adjVal}✨`);
                }
            });
        });
    });
    let modSlidersStr = modSlidersArr.length > 0 ? modSlidersArr.join('  ') : 'Aucun ajustement IA';

    let idCardHtml = `
        <div class="border-t border-primary-container/20 bg-surface-container/90 p-md shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
            <div class="relative bg-[#08080A] border border-primary-container p-sm md:p-md rounded-lg mb-md overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMC41IiBmaWxsPSIjMDBmMGZmIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')] before:opacity-20 before:pointer-events-none" id="technical-id-card">
                <div class="absolute top-0 right-0 bg-primary-container text-black font-label-caps text-[8px] px-2 py-0.5 rounded-bl-md font-bold z-20">CONFIDENTIAL // VERIFIED</div>
                <div class="flex gap-md items-start relative z-10">
                    <div class="w-16 h-16 md:w-20 md:h-20 rounded border border-primary-container/50 overflow-hidden shrink-0 bg-black">
                        <img alt="ID Card Avatar" class="w-full h-full object-cover grayscale contrast-125 mix-blend-lighten" src="./assets/presets/${result.preset.id}.png">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-display-lg text-[14px] md:text-[16px] text-white tracking-tight leading-none mb-1 shadow-primary-container drop-shadow-md truncate">FC26 RECIPE CARD</h4>
                        <div class="text-[9px] md:text-[10px] font-label-caps text-primary-container tracking-widest mb-2 opacity-80 truncate">Généré par ScanMyFace.tech</div>
                        
                        <div class="font-mono text-[9px] md:text-[10px] text-on-surface-variant leading-tight space-y-1">
                            <div><span class="text-white font-bold">BASE :</span> Tête ${mainPid}</div>
                            <div class="break-words"><span class="text-white font-bold">ZONE MIX :</span> ${zoneMixStr}</div>
                            <div class="break-words"><span class="text-white font-bold">CURSEURS :</span> ${modSlidersStr}</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-sm items-center">
                <button class="flex-1 w-full py-3 md:py-2 bg-primary-container/10 border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span> COPY RECIPE
                </button>
                <button class="flex-1 w-full py-3 md:py-2 bg-transparent border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]" onclick="window.shareResults(${result.preset.id})">
                    <span class="material-symbols-outlined text-[16px]">share</span> SHARE
                </button>
                <button class="flex-1 w-full py-3 md:py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold" onclick="window.downloadIDCard()">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>
            </div>
        </div>
    `;

    container.innerHTML = tabsHtml + contentHtml + idCardHtml;"""

start_idx = content.find(old_recipe_start)
end_idx = content.find(old_recipe_end) + len(old_recipe_end)
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_recipe_logic + content[end_idx:]


# -------------------------------------------------------------
# TASK 3: Share Action with Canvas
# -------------------------------------------------------------
old_share_start = "// Global function to share results"
old_share_end = "    }\n};"

new_share_logic = """// Global function to share results (Image generation)
window.shareResults = async function(presetId) {
    const card = document.getElementById('technical-id-card');
    if (!card) return;
    
    // Feedback UI
    const shareBtn = event.currentTarget;
    const originalText = shareBtn.innerHTML;
    shareBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> GENERATING...';
    
    try {
        const canvas = await html2canvas(card, {
            backgroundColor: '#08080A',
            scale: 2
        });
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'ScanMyFace_Recipe.png', { type: 'image/png' });
            const shareData = {
                title: 'ScanMyFace - Mon Preset FC26',
                text: `Je viens de créer mon preset visage pour FC26 avec ScanMyFace.tech ! 🎮 ID Preset : ${presetId}\\n\\nRejoins-nous sur https://scanmyface.tech`,
                files: [file]
            };
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                // Fallback: Download instead if sharing files is not supported
                const dataUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'ScanMyFace_Recipe.png';
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(dataUrl);
                alert('Partage natif non supporté. Image téléchargée !');
            }
            shareBtn.innerHTML = originalText;
        }, 'image/png');
    } catch (err) {
        console.error('Erreur lors du partage:', err);
        shareBtn.innerHTML = originalText;
        alert("Une erreur est survenue lors de la préparation de l'image.");
    }
};"""

s_idx = content.find(old_share_start)
e_idx = content.find(old_share_end, s_idx) + len(old_share_end)
if s_idx != -1 and e_idx != -1:
    content = content[:s_idx] + new_share_logic + content[e_idx:]

with open(js_path, 'w') as f:
    f.write(content)

print("Mobile and Share polish applied.")
