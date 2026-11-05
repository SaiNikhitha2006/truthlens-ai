import io
import base64
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

def generate_sample_authentic() -> bytes:
    """Generates an authentic synthetic photograph with natural noise and optical blur."""
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Sky gradient
    for y in range(240):
        val = int(180 + (y / 240.0) * 50)
        img[y, :, 0] = min(255, val + 20)  # B
        img[y, :, 1] = min(255, val - 10)  # G
        img[y, :, 2] = min(255, val - 50)  # R
    # Landscape hills
    for x in range(640):
        hill_h = int(240 + 35 * np.sin(x / 40.0) + 15 * np.cos(x / 15.0))
        img[hill_h:, x, 0] = 30
        img[hill_h:, x, 1] = int(110 + (hill_h % 20))
        img[hill_h:, x, 2] = 40
    # Add realistic Gaussian sensor noise
    noise = np.random.normal(0, 4, img.shape).astype(np.float32)
    img_noisy = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    
    # Save as JPEG with natural compression
    pil_img = Image.fromarray(cv2.cvtColor(img_noisy, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=92)
    return buf.getvalue()

def generate_sample_ai() -> bytes:
    """Generates an AI-like image with high-frequency periodic checkerboard artifacts (GAN signature)."""
    img = np.zeros((512, 512, 3), dtype=np.uint8)
    # Smooth gradient background
    y, x = np.mgrid[0:512, 0:512]
    r = np.sqrt((x - 256)**2 + (y - 256)**2)
    img[:, :, 0] = np.clip(180 - r * 0.4, 40, 220).astype(np.uint8)
    img[:, :, 1] = np.clip(140 + r * 0.1, 30, 200).astype(np.uint8)
    img[:, :, 2] = np.clip(220 - r * 0.3, 50, 240).astype(np.uint8)

    # Inject periodic high-frequency checkerboard grid (simulates deconvolution upsampler)
    grid_pattern = (np.sin(x * 0.785) * np.cos(y * 0.785) * 18).astype(np.float32)
    img_synth = np.clip(img.astype(np.float32) + np.repeat(grid_pattern[:, :, np.newaxis], 3, axis=2), 0, 255).astype(np.uint8)

    # Smooth out edges artificially (AI skin smoothing)
    blurred = cv2.bilateralFilter(img_synth, 9, 75, 75)

    pil_img = Image.fromarray(cv2.cvtColor(blurred, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)
    # Draw avatar face silhouette
    draw.ellipse([160, 120, 352, 360], fill=(235, 190, 170), outline=(210, 160, 140), width=2)
    draw.ellipse([200, 200, 240, 225], fill=(60, 45, 40)) # eye
    draw.ellipse([272, 200, 312, 225], fill=(60, 45, 40)) # eye
    draw.arc([220, 270, 292, 310], start=0, end=180, fill=(180, 50, 60), width=4) # mouth

    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def generate_sample_spliced() -> bytes:
    """Generates a manipulated document/photo with spliced region having extreme ELA divergence."""
    # Base background document
    base = Image.new("RGB", (600, 450), color=(248, 249, 250))
    draw = ImageDraw.Draw(base)

    # Draw letterhead
    draw.rectangle([40, 30, 560, 70], fill=(28, 37, 65))
    draw.text((55, 42), "CENTRAL REGULATORY BOARD - OFFICIAL AUDIT MEMO", fill=(255, 255, 255))
    
    # Text lines
    for i in range(6):
        draw.line([(40, 110 + i * 28), (560, 110 + i * 28)], fill=(220, 224, 230), width=1)

    draw.text((45, 130), "Item Ref #90214-B: Core Fiscal Reserves Discrepancy", fill=(50, 50, 50))
    draw.text((45, 170), "Reported Status: Normal Operations Confirmed", fill=(60, 60, 60))
    
    # Save base at quality 60 (high compression history)
    base_buf = io.BytesIO()
    base.save(base_buf, format="JPEG", quality=60)
    base_buf.seek(0)
    base_compressed = Image.open(base_buf).convert("RGB")

    # Now splice in a pristine, uncompressed high-contrast tamper patch (e.g. fabricated alert)
    tamper_patch = Image.new("RGB", (320, 70), color=(255, 220, 220))
    t_draw = ImageDraw.Draw(tamper_patch)
    t_draw.rectangle([0, 0, 319, 69], outline=(200, 40, 40), width=2)
    t_draw.text((15, 15), "TAMPERED: EMERGENCY DEPOSIT FREEZE", fill=(180, 0, 0))
    t_draw.text((15, 38), "Mandatory Liquidation Initiated Immediately", fill=(140, 0, 0))

    # Paste patch onto compressed base
    base_compressed.paste(tamper_patch, (140, 230))

    # Final save at high quality (creates severe ELA block divergence at patch coordinates)
    final_buf = io.BytesIO()
    base_compressed.save(final_buf, format="JPEG", quality=95)
    return final_buf.getvalue()

def get_sample_catalogue() -> list:
    """Returns sample images as base64 data URLs for instant UI testing without external network."""
    auth_bytes = generate_sample_authentic()
    ai_bytes = generate_sample_ai()
    splice_bytes = generate_sample_spliced()

    return [
        {
            "id": "sample_authentic",
            "title": "Authentic Optical Photograph",
            "type": "AUTHENTIC",
            "description": "Natural optical camera capture with standard 1/f Fourier decay and uniform ELA sensor noise.",
            "data_url": f"data:image/jpeg;base64,{base64.b64encode(auth_bytes).decode('utf-8')}"
        },
        {
            "id": "sample_ai",
            "title": "Synthetic AI Generator (Diffusion/GAN)",
            "type": "AI_GENERATED",
            "description": "Contains periodic high-frequency checkerboard artifacts and spectral plateaus typical of latent decoders.",
            "data_url": f"data:image/jpeg;base64,{base64.b64encode(ai_bytes).decode('utf-8')}"
        },
        {
            "id": "sample_spliced",
            "title": "Doctored Document (Spliced Text)",
            "type": "MANIPULATED",
            "description": "Digital cut-and-paste tampering with stark localized JPEG compression discrepancy.",
            "data_url": f"data:image/jpeg;base64,{base64.b64encode(splice_bytes).decode('utf-8')}"
        }
    ]
