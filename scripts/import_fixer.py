import os, re, fileinput

root = r'd:/Downloads/Hostly/Vignova 1/backend'
# Mapping of old prefix to new absolute import prefix
mappings = {
    'from db': 'from backend.db',
    'import db': 'import backend.database',
    'from api': 'from backend.api',
    'import api': 'import backend.api',
    'from models': 'from backend.models',
    'import models': 'import backend.models',
    'from schemas': 'from backend.schemas',
    'import schemas': 'import backend.schemas',
    'from crud': 'from backend.crud',
    'import crud': 'import backend.crud',
    'from core': 'from backend.core',
    'import core': 'import backend.core',
    'from tasks': 'from backend.tasks',
    'import tasks': 'import backend.tasks',
}

for dirpath, _, files in os.walk(root):
    for fname in files:
        if not fname.endswith('.py'):
            continue
        fpath = os.path.join(dirpath, fname)
        # Read file content
        with open(fpath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        changed = False
        new_lines = []
        for line in lines:
            new_line = line
            for old, new in mappings.items():
                if line.lstrip().startswith(old + ' '):
                    # Preserve indentation
                    indent = line[:len(line) - len(line.lstrip())]
                    new_line = indent + line.lstrip().replace(old, new, 1)
                    changed = True
                    break
            new_lines.append(new_line)
        if changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"Modified {fpath}")
