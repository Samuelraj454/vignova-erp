import os

def replace_in_file(file_path, replacements):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = content
        for old_str, new_str in replacements.items():
            new_content = new_content.replace(old_str, new_str)
        if content != new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path}")
    except Exception as e:
        print(f"Skipping {file_path}: {e}")

replacements = {
    'backend.database.': 'backend.database.',
    'from backend.database ': 'from backend.database ',
    'import backend.database': 'import backend.database',
    'backend.core.main': 'backend.core.main',
    '/src/app/main.tsx': '/src/app/main.tsx',
    "import '../styles/index.css'": "import '../styles/index.css'",
    "import '../styles/App.css'": "import '../styles/App.css'",
    'stores/AuthContext': 'stores/AuthContext',
    'stores/ThemeContext': 'stores/ThemeContext',
}

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'venv' in root or '__pycache__' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.py', '.ts', '.tsx', '.json', '.yaml', '.yml', '.html', '.ini')):
            replace_in_file(os.path.join(root, file), replacements)

print("Import replacements complete.")
