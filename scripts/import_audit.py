import os, re, sys
root = r'd:/Downloads/Hostly/Vignova 1/backend'
patterns = [r'from\s+db\.', r'from\s+models\.', r'from\s+core\.', r'from\s+schemas\.', r'from\s+api\.', r'from\s+crud\.', r'import\s+db', r'import\s+models']
for subdir, dirs, files in os.walk(root):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(subdir, f)
            try:
                with open(path, 'r', encoding='utf-8') as fh:
                    lines = fh.readlines()
                for i, line in enumerate(lines, 1):
                    for pat in patterns:
                        if re.search(pat, line):
                            print(f"{path}:{i}: {line.strip()}")
            except Exception as e:
                print('Error reading', path, e, file=sys.stderr)
