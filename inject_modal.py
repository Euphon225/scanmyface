import re

html_path = '/Users/loriekeita/Desktop/fc26/app/index.html'
with open(html_path, 'r') as f:
    content = f.read()

# 1. Add Tailwind and Fonts to Head
head_injection = """
    <!-- Tailwind & Material Symbols for New Modal UI -->
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                "on-surface": "#e5e1e4", "primary-container": "#00f0ff", "surface-container-lowest": "#0e0e10",
                "on-surface-variant": "#b9cacb", "tertiary-container": "#fed639", "surface-container-low": "#1c1b1d"
              },
              "fontFamily": { "title-sm": ["Lexend"], "label-caps": ["Inter"], "display-lg": ["Lexend"], "headline-md": ["Lexend"], "body-md": ["Inter"] }
            }
          }
        }
    </script>
"""

# Only inject if not already there
if "tailwindcss.com" not in content:
    content = content.replace('</head>', head_injection + '</head>')

# 2. Add the Modal HTML
# I'll copy the structure and modify the IDs for the JS to target
modal_html = """
    <!-- NOUVEAU MODAL SCAN (Injecté) -->
    <div id="new-scan-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-md md:p-xl hidden">
        <div class="w-full max-w-[1100px] bg-surface-container-lowest/80 backdrop-blur-[12px] border border-primary-container rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.15)] relative flex flex-col max-h-[921px]">
            <!-- Close Button -->
            <button id="btn-close-modal" aria-label="Close" class="absolute top-md right-md text-on-surface-variant hover:text-primary-container transition-colors z-20" style="top: 16px; right: 16px;">
                <span class="material-symbols-outlined">close</span>
            </button>
            <!-- Modal Header -->
            <div class="px-xl py-md border-b border-white/10 flex items-center justify-center shrink-0" style="padding: 16px;">
                <span class="font-title-sm text-title-sm text-on-surface tracking-tighter uppercase" style="color: white;">Cranium Analyzer</span>
            </div>
            <!-- Modal Body Grid -->
            <div class="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2" style="display: flex; flex-direction: row; width: 100%; min-height: 500px;">
                <!-- Left Column: Scan Interface -->
                <div class="p-xl border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col items-center justify-center bg-surface/30" style="flex: 1; padding: 24px; border-right: 1px solid rgba(255,255,255,0.1);">
                    <div class="w-full flex justify-between items-center mb-md px-sm" style="width: 100%; display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <button id="btn-back-modal" class="text-on-surface-variant hover:text-primary-container transition-colors flex items-center" style="color: #b9cacb; display: flex; align-items: center;">
                            <span class="material-symbols-outlined mr-xs">arrow_back</span>
                            <span class="font-label-caps text-label-caps">BACK</span>
                        </button>
                        <span class="font-label-caps text-label-caps text-primary-container tracking-widest" style="color: #00f0ff;">SCANNING</span>
                    </div>
                    
                    <!-- Camera Frame -->
                    <div class="relative w-full max-w-[340px] aspect-[3/4] rounded-lg border border-primary-container/60 bg-[#0A0A0C] shadow-[0_0_20px_rgba(0,240,255,0.25)_inset] overflow-hidden flex items-center justify-center" style="position: relative; width: 100%; max-width: 340px; aspect-ratio: 3/4; border: 1px solid rgba(0,240,255,0.6); border-radius: 8px; display: flex; justify-content: center; align-items: center;">
                        <video id="input-video-new" class="w-full h-full object-cover hidden" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <img id="input-image-new" class="w-full h-full object-cover opacity-70 mix-blend-luminosity hidden" style="width: 100%; height: 100%; object-fit: cover;">
                        
                        <!-- Target Corners -->
                        <div class="absolute top-md left-md w-lg h-lg border-t-2 border-l-2 border-primary-container" style="position: absolute; top: 16px; left: 16px; width: 24px; height: 24px; border-top: 2px solid #00f0ff; border-left: 2px solid #00f0ff;"></div>
                        <div class="absolute top-md right-md w-lg h-lg border-t-2 border-r-2 border-primary-container" style="position: absolute; top: 16px; right: 16px; width: 24px; height: 24px; border-top: 2px solid #00f0ff; border-right: 2px solid #00f0ff;"></div>
                        <div class="absolute bottom-md left-md w-lg h-lg border-b-2 border-l-2 border-primary-container" style="position: absolute; bottom: 16px; left: 16px; width: 24px; height: 24px; border-bottom: 2px solid #00f0ff; border-left: 2px solid #00f0ff;"></div>
                        <div class="absolute bottom-md right-md w-lg h-lg border-b-2 border-r-2 border-primary-container" style="position: absolute; bottom: 16px; right: 16px; width: 24px; height: 24px; border-bottom: 2px solid #00f0ff; border-right: 2px solid #00f0ff;"></div>
                        
                        <!-- Cyan Laser Line (Animated in JS if needed) -->
                        <div id="laser-line-new" class="absolute top-1/2 left-0 w-full h-[1px] bg-primary-container shadow-[0_0_12px_2px_#00F0FF] opacity-80 hidden" style="position: absolute; top: 50%; width: 100%; height: 1px; background: #00f0ff; box-shadow: 0 0 12px 2px #00f0ff;"></div>
                    </div>

                    <!-- Analysis Progress -->
                    <div id="new-scan-progress" class="w-full max-w-[340px] mt-lg hidden" style="width: 100%; max-width: 340px; margin-top: 24px;">
                        <div class="flex justify-between items-end mb-sm" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span class="font-label-caps text-[10px] text-primary-container animate-pulse" style="color: #00f0ff; font-size: 10px;">Analyzing facial features...</span>
                            <span class="font-label-caps text-label-caps text-on-surface" style="color: white;" id="progress-percent-new">0%</span>
                        </div>
                        <div class="w-full h-unit bg-white/10 rounded-full overflow-hidden" style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px;">
                            <div id="progress-bar-fill-new" class="h-full bg-primary-container w-[0%] shadow-[0_0_8px_#00F0FF]" style="height: 100%; background: #00f0ff; width: 0%; transition: width 0.3s;"></div>
                        </div>
                    </div>

                    <!-- Scan Actions (Crop Validation) -->
                    <div id="new-scan-actions" class="w-full max-w-[340px] mt-xl flex gap-md" style="width: 100%; max-width: 340px; margin-top: 32px; display: flex; gap: 16px;">
                        <button id="btn-confirm-analyze-new" class="w-full py-sm bg-primary-container text-[#0A0A0C] font-label-caps text-label-caps hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform rounded flex items-center justify-center gap-xs font-bold" style="width: 100%; padding: 12px; background: #00f0ff; color: #0a0a0c; border-radius: 4px; border: none; font-weight: bold; cursor: pointer;">
                            <span class="material-symbols-outlined text-[16px]">check</span>
                            VALIDER ET ANALYSER
                        </button>
                    </div>
                </div>

                <!-- Right Column: Results View -->
                <div class="p-xl flex flex-col h-full" style="flex: 1; padding: 24px; display: flex; flex-direction: column;">
                    <div class="flex items-center gap-sm mb-lg shrink-0" style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
                        <span class="material-symbols-outlined text-primary-container" style="color: #00f0ff;">hub</span>
                        <h2 class="font-title-sm text-title-sm text-on-surface uppercase tracking-tight" style="color: white;">RÉSULTATS - TOP MATCHES</h2>
                    </div>
                    <p class="font-body-md text-[14px] text-on-surface-variant mb-lg shrink-0" style="color: #b9cacb; margin-bottom: 24px;">
                        L'IA a trouvé ces 3 modèles. Lequel te semble le plus proche ?
                    </p>
                    
                    <!-- Dynamic Results injected here -->
                    <div class="flex flex-col gap-md flex-1 overflow-y-auto pr-sm" id="new-result-container" style="display: flex; flex-direction: column; gap: 16px; flex: 1; overflow-y: auto;">
                        <!-- Cards will be built in script.js -->
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
"""

# Inject before </div><script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js">
if "new-scan-modal" not in content:
    content = content.replace('    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js">', modal_html + '\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js">')

with open(html_path, 'w') as f:
    f.write(content)

print("Modal HTML injected successfully.")
