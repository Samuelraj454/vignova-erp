import os
import re

def find_hardcoded_arrays():
    for root, dirs, files in os.walk('frontend/src/pages'):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    if re.search(r'const [A-Za-z0-9_]+ \= \[\s*\{', content) or re.search(r'mock[A-Z]', content) or re.search(r'sample[A-Z]', content):
                        print(f"Found potential mock data in {path}")

find_hardcoded_arrays()
