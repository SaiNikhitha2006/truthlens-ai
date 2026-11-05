import io
import base64
import numpy as np
import cv2
from PIL import Image

def generate_noise_print(image_bytes: bytes) -> dict:
    """
    Extracts 2D Photo-Response Non-Uniformity (PRNU) / Sensor Noise Residual Print.
    Camera sensors introduce an immutable, unique noise pattern (fingerprint) across every shot.
    AI generation or localized splicing introduces noise voids or mismatched noise floors.
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")
        gray = np.array(pil_img, dtype=np.float32)

        # High-pass filtering to isolate noise residue
        # Apply median filter to estimate underlying clean signal, then subtract
        denoised = cv2.medianBlur(gray.astype(np.uint8), 3).astype(np.float32)
        noise_residual = gray - denoised

        # Measure noise statistics
        noise_mean = float(np.mean(noise_residual))
        noise_std = float(np.std(noise_residual))

        # Local noise variance homogeneity: standard deviation across 16x16 grid
        h, w = noise_residual.shape
        step = 32
        local_vars = []
        for y in range(0, h - step + 1, step):
            for x in range(0, w - step + 1, step):
                block = noise_residual[y:y+step, x:x+step]
                local_vars.append(float(np.var(block)))

        var_of_vars = float(np.std(local_vars)) if local_vars else 0.0

        # Contrast-stretched visualization
        norm_noise = cv2.normalize(noise_residual, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        colored_noise = cv2.applyColorMap(norm_noise, cv2.COLORMAP_VIRIDIS)

        _, buf = cv2.imencode(".jpg", colored_noise, [cv2.IMWRITE_JPEG_QUALITY, 90])
        noise_b64 = base64.b64encode(buf).decode("utf-8")

        # Assessment
        if var_of_vars > 15.0 or noise_std < 1.2:
            status = "HETEROGENEOUS_NOISE_FLOOR"
            desc = f"Sensor noise residual is spatially inconsistent (variance variance: {var_of_vars:.2f}). Indicates localized synthetic inpainting or pasted elements."
            score = 30
        elif var_of_vars > 8.0:
            status = "MODERATE_NOISE_VARIATION"
            desc = f"Moderate noise variation ({var_of_vars:.2f}). Minor digital manipulation or heavy post-processing compression."
            score = 65
        else:
            status = "HOMOGENEOUS_SENSOR_NOISE"
            desc = f"Uniform PRNU noise floor ({var_of_vars:.2f}). Optical sensor characteristics are homogeneous throughout the image plane."
            score = 92

        return {
            "status": status,
            "noise_std": round(noise_std, 2),
            "noise_variance_heterogeneity": round(var_of_vars, 2),
            "description": desc,
            "score": score,
            "noise_map_base64": f"data:image/jpeg;base64,{noise_b64}"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "noise_std": 0.0,
            "noise_variance_heterogeneity": 0.0,
            "description": str(e),
            "score": 60,
            "noise_map_base64": ""
        }
