import re

js_path = '/Users/loriekeita/Desktop/fc26/app/script.js'
with open(js_path, 'r') as f:
    content = f.read()

# I will replace all "const faceGuide =" with "let faceGuide =" or just remove the const keyword if we use it without declaring.
# Actually, the safest way is to replace "const faceGuide = " with "var faceGuide = " since var can be redeclared without SyntaxError.

content = content.replace("const faceGuide =", "var faceGuide =")

with open(js_path, 'w') as f:
    f.write(content)

print("Fixed SyntaxError by using var for faceGuide.")
