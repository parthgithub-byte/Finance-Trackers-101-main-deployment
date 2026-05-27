"""
Cleanup script — run once to remove junk files from the project.
Safe to delete after running.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "backend")
SRC = os.path.join(ROOT, "src")

# Backend files to remove
backend_junk = [
    "updategraph.py",
    "quick.py",
    "show_data.py",
    "dashboard.py",
    "generate.py",
    "init_db.py",
    "reset_db.py",
    "barplot.html",
    "heatmap.html",
    "linechart.html",
    "piechart.html",
]

for fname in backend_junk:
    path = os.path.join(BACKEND, fname)
    if os.path.exists(path):
        os.remove(path)
        print(f"  Deleted: backend/{fname}")
    else:
        print(f"  (already gone): backend/{fname}")

# Delete __pycache__
pycache = os.path.join(BACKEND, "__pycache__")
if os.path.exists(pycache):
    shutil.rmtree(pycache)
    print("  Deleted: backend/__pycache__")

# Frontend files to remove (unused)
src_junk = [
    "UserProfile.tsx",
    "pages/Dashboard.tsx",
]
for fname in src_junk:
    path = os.path.join(SRC, fname)
    if os.path.exists(path):
        os.remove(path)
        print(f"  Deleted: src/{fname}")
    else:
        print(f"  (already gone): src/{fname}")

print("\nCleanup complete.")
