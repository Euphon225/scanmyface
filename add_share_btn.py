import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 1 & 3: Add share button and social links row
# -------------------------------------------------------------
old_actions = """            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-sm items-center">
                <button class="flex-1 w-full py-2 bg-primary-container/10 border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span> COPY ALL TABS RECIPE
                </button>
                <button class="flex-1 w-full py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold" onclick="window.downloadIDCard()">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>
            </div>
        </div>
    `;"""

new_actions = """            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-sm items-center">
                <button class="flex-1 w-full py-2 bg-primary-container/10 border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <span class="material-symbols-outlined text-[16px]">content_copy</span> COPY RECIPE
                </button>
                <button class="flex-1 w-full py-2 bg-transparent border border-primary-container text-primary-container font-label-caps text-[11px] hover:bg-primary-container hover:text-black transition-colors rounded flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]" onclick="window.shareResults(${result.preset.id})">
                    <span class="material-symbols-outlined text-[16px]">share</span> PARTAGER LE RÉSULTAT
                </button>
                <button class="flex-1 w-full py-2 bg-primary-container text-black font-label-caps text-[11px] hover:scale-[1.02] transition-transform rounded flex items-center justify-center gap-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold" onclick="window.downloadIDCard()">
                    <span class="material-symbols-outlined text-[16px]">download</span> DOWNLOAD ID CARD
                </button>
            </div>
            
            <!-- Social Networks -->
            <div class="mt-sm flex justify-center gap-sm">
                <span class="font-label-caps text-[10px] text-on-surface-variant self-center">SHARE RESULT:</span>
                <a class="w-8 h-8 rounded-full bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/50 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors" href="https://twitter.com/intent/tweet?text=Je%20viens%20de%20cr%C3%A9er%20mon%20preset%20visage%20pour%20FC26%20avec%20ScanMyFace.tech%20!%20%F0%9F%8E%AE%20ID%20Preset%20%3A%20${result.preset.id}%0A%0ARejoins-nous%20sur%20https%3A%2F%2Fscanmyface.tech" target="_blank">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
                </a>
                <a class="w-8 h-8 rounded-full bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/50 flex items-center justify-center hover:bg-[#FF4500] hover:text-white transition-colors" href="https://reddit.com/submit?title=Mon%20Preset%20FC26%20Pro%20Clubs&url=https://scanmyface.tech" target="_blank">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-2.467 3.928c-1.295 0-2.046-.714-2.096-.764a.345.345 0 1 0-.493.483c.105.105 1.002 1.026 2.589 1.026 1.587 0 2.484-.92 2.589-1.026a.345.345 0 1 0-.493-.483c-.05.05-.801.764-2.096.764z"></path></svg>
                </a>
            </div>
        </div>
    `;"""

content = content.replace(old_actions, new_actions)

# -------------------------------------------------------------
# TASK 2: Implement shareResults
# -------------------------------------------------------------
share_func = """
// Global function to share results
window.shareResults = async function(presetId) {
    const shareText = `Je viens de créer mon preset visage pour FC26 avec ScanMyFace.tech ! 🎮 ID Preset : ${presetId}`;
    const shareUrl = 'https://scanmyface.tech';
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'ScanMyFace - Mon Preset FC26',
                text: shareText,
                url: shareUrl
            });
        } catch (err) {
            console.error('Erreur lors du partage natif:', err);
        }
    } else {
        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(`${shareText}\\n${shareUrl}`);
            alert('Lien copié ! Partagez-le avec vos amis.');
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
        }
    }
};
"""

if "window.shareResults =" not in content:
    content += share_func

with open(js_path, 'w') as f:
    f.write(content)

print("Share feature UI and logic added.")
