#!/usr/bin/env python3
"""Generate app assets from logo.png"""

from PIL import Image
import os

logo_path = "assets/logo.png"
assets_dir = "assets"

if not os.path.exists(logo_path):
    print(f"❌ {logo_path} not found!")
    exit(1)

print(f"📷 Loading {logo_path}...")
logo = Image.open(logo_path)

# Define asset specs: (output_filename, size_in_px)
assets = [
    ("icon.png", (1024, 1024)),
    ("splash.png", (1200, 1200)),
    ("adaptive-icon.png", (1024, 1024)),
    ("favicon.png", (192, 192)),
]

for filename, size in assets:
    output_path = os.path.join(assets_dir, filename)
    
    try:
        print(f"🔧 Generating {filename} ({size[0]}x{size[1]})...")
        
        # Create square canvas with black background
        canvas = Image.new("RGBA", size, (15, 15, 35, 255))  # Dark blue-ish
        
        # Resize logo to fit
        logo_copy = logo.copy()
        logo_copy.thumbnail((size[0] - 100, size[1] - 100), Image.Resampling.LANCZOS)
        
        # Paste centered
        x = (size[0] - logo_copy.width) // 2
        y = (size[1] - logo_copy.height) // 2
        
        if logo_copy.mode == "RGBA":
            canvas.paste(logo_copy, (x, y), logo_copy)
        else:
            canvas.paste(logo_copy, (x, y))
        
        # Convert to RGB for PNG (no transparency except for favicon)
        if filename != "favicon.png":
            rgb_canvas = Image.new("RGB", size, (15, 15, 35))
            rgb_canvas.paste(canvas, mask=canvas.split()[3] if canvas.mode == "RGBA" else None)
            canvas = rgb_canvas
        
        # Save
        canvas.save(output_path, "PNG", optimize=False)
        file_size = os.path.getsize(output_path) / 1024
        print(f"✅ {filename} created ({file_size:.1f}KB)")
        
    except Exception as e:
        print(f"❌ Error generating {filename}: {e}")

print("\n✅ All assets generated successfully!")
