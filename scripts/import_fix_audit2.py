import os, re
root = r'd:/Downloads/Hostly/Vignova 1/backend'
patterns = [r'from\s+db\.', r'from\s+api\.', r'from\s+models\.', r'from\s+schemas\.', r'from\s+crud\.', r'from\s+core\.']
for dirpath, _, files in os.walk(root):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(dirpath, f)
            with open(path, 'r', encoding='utf-8') as fh:
                for i, line in enumerate(fh, 1):
                    for pat in patterns:
                        if re.search(pat, line):
                            print(f"{path}:{i}:{line.strip()}")
