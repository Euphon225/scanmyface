import re

html_path = '/Users/loriekeita/Desktop/fc26/app/index.html'
with open(html_path, 'r') as f:
    content = f.read()

old_modal_wrapper = '<div id="new-scan-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-md md:p-xl hidden">'
new_modal_wrapper = '<div id="new-scan-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-xl hidden">'
content = content.replace(old_modal_wrapper, new_modal_wrapper)

old_modal_inner = '<div class="w-[95vw] h-[95vh] bg-[#0A0A0C] border border-primary-container/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">'
new_modal_inner = '<div class="w-full h-full md:w-[95vw] md:h-[95vh] bg-[#0A0A0C] border-none md:border border-primary-container/30 rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">'
content = content.replace(old_modal_inner, new_modal_inner)

with open(html_path, 'w') as f:
    f.write(content)

print("Mobile optimizations applied to index.html")
