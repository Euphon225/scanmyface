import re

html_path = '/Users/loriekeita/Desktop/fc26/app/index.html'
with open(html_path, 'r') as f:
    content = f.read()

# -------------------------------------------------------------
# TASK 1: Agrandir l'image et l'en-tête (max-w-[480px])
# -------------------------------------------------------------
old_header_width = r'<div class="w-full flex justify-between items-center mb-md px-sm" style="width: 100%; display: flex; justify-content: space-between; margin-bottom: 16px;">'
new_header_width = r'<div class="w-full max-w-[480px] flex justify-between items-center mb-md px-sm mx-auto" style="width: 100%; max-width: 480px; display: flex; justify-content: space-between; margin-bottom: 16px; margin-left: auto; margin-right: auto;">'
content = content.replace(old_header_width, new_header_width)

# Also update the container sizes from 340 to 480
content = content.replace('max-w-[340px]', 'max-w-[480px]')
content = content.replace('max-width: 340px', 'max-width: 480px')

# -------------------------------------------------------------
# TASK 3: Header Navigation
# -------------------------------------------------------------
old_header = """    <header class="main-header">
        <div class="logo">FC26</div>
        <div id="lang-bar">
            <button class="lang-btn active" data-lang="fr">FR</button>
            <span class="lang-sep">|</span>
            <button class="lang-btn" data-lang="en">EN</button>
        </div>
    </header>"""

new_header = """    <header class="main-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 15px;">
            <a href="../index.html" class="logo" style="text-decoration: none; display: flex; align-items: center; border: none; background: transparent;">
                <img src="./assets/favicon.png" alt="Logo" style="height: 32px; filter: drop-shadow(0 0 5px rgba(0,240,255,0.5));">
            </a>
            <nav style="display: flex; gap: 10px;">
                <a href="../index.html" style="text-decoration: none; color: #fff; background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.15); transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">🏠 Landing Page</a>
                <a href="./design/engine/index.html" style="text-decoration: none; color: #fff; background: rgba(0,240,255,0.1); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(0,240,255,0.3); transition: all 0.2s;" onmouseover="this.style.background='rgba(0,240,255,0.2)'" onmouseout="this.style.background='rgba(0,240,255,0.1)'">🎮 Sélecteur de jeux</a>
            </nav>
        </div>
        <div id="lang-bar">
            <button class="lang-btn active" data-lang="fr">FR</button>
            <span class="lang-sep">|</span>
            <button class="lang-btn" data-lang="en">EN</button>
        </div>
    </header>"""

content = content.replace(old_header, new_header)

with open(html_path, 'w') as f:
    f.write(content)

print("HTML UI tasks 1 and 3 applied.")
