import os
import glob
import subprocess

def git_mv(src, dst):
    if not os.path.exists(src): return
    if os.path.isdir(dst) and not os.path.exists(dst): os.makedirs(dst, exist_ok=True)
    print(f"Moving {src} to {dst}")
    subprocess.run(["git", "mv", src, dst], check=False)

def git_mv_glob(pattern, dst):
    for file in glob.glob(pattern):
        git_mv(file, dst)

# Root level moves
git_mv("README.md", "docs/")
git_mv("DEPLOYMENT_CHECKLIST.md", "docs/")
git_mv("deployment.md", "docs/")
git_mv("docker-compose.yml", "deployment/")
git_mv("render.yaml", "deployment/")
git_mv("vercel.json", "deployment/")

# Backend moves
git_mv_glob("backend/db/*", "backend/database/")
git_mv_glob("backend/test*.py", "backend/tests/")
git_mv_glob("backend/*test_report*.txt", "backend/tests/")
git_mv_glob("test_*.py", "backend/tests/")
git_mv("backend/main.py", "backend/core/")
git_mv_glob("backend/scripts/*", "scripts/")
git_mv("alembic.ini", "backend/")
git_mv("alembic", "backend/")
git_mv_glob("backend/import*.py", "scripts/")
git_mv("backend/fix_models.py", "scripts/")

print("Files moved successfully")
