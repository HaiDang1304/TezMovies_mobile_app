#!/usr/bin/env python3
"""Fix PNG CRC errors by regenerating images without interlacing."""

from PIL import Image
import os

assets_dir = "assets"
images = ["icon.png", "splash.png", "adaptive-icon.png", "favicon.png"]

for img_file in images:
    img_path = os.path.join(assets_dir, img_file)
    if not os.path.exists(img_path):
        print(f"⚠️  {img_file} not found, skipping...")
        continue
    
    try:
        print(f"🔧 Processing {img_file}...")
        
        # Open image
        img = Image.open(img_path)
        
        # Convert to RGB if needed
        if img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
            img = background
        
        # Save without interlacing (optimize=False)
        img.save(img_path, "PNG", optimize=False, interlace=False)
        print(f"✅ {img_file} fixed!")
        
    except Exception as e:
        print(f"❌ Error processing {img_file}: {e}")

print("\n✅ All images regenerated!")
