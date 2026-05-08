import cv2
import os

cursor_dir = r"C:\D\Projects\EY\enterprise-cost-intelligence\frontend\public\cursors"
files = ["default.png", "pointer.png"]

for f in files:
    path = os.path.join(cursor_dir, f)
    if os.path.exists(path):
        img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        # Resize to 32x32 which is standard for cursors
        resized = cv2.resize(img, (32, 32), interpolation=cv2.INTER_AREA)
        cv2.imwrite(path, resized)
        print(f"Resized {f} to 32x32")
