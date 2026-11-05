import io
import base64
import numpy as np
import cv2
from PIL import Image

def analyze_chrominance_channels(image_bytes: bytes) -> dict:
    """
    Decomposes the image into YCbCr and LAB color spaces.
    Deepfakes and GAN composites frequently suffer from chrominance boundary mismatch
    and color bleed along the face boundary, due to neural decoders reconstructing
    luminance more sharply than chroma components.
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        rgb = np.array(pil_img)
        
        # Convert to YCrCb
        ycrcb = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb)
        y_chan, cr_chan, cb_chan = cv2.split(ycrcb)

        # Compute gradient edges on Luminance vs Chrominance
        sobel_y = cv2.Sobel(y_chan, cv2.CV_64F, 1, 1, ksize=3)
        sobel_cb = cv2.Sobel(cb_chan, cv2.CV_64F, 1, 1, ksize=3)
        sobel_cr = cv2.Sobel(cr_chan, cv2.CV_64F, 1, 1, ksize=3)

        var_y = float(np.var(sobel_y))
        var_cb = float(np.var(sobel_cb))
        var_cr = float(np.var(sobel_cr))

        # Chrominance to luminance edge ratio
        chroma_edge_ratio = float((var_cb + var_cr) / (2.0 * (var_y + 1e-6)))

        # Chrominance disparity heatmap
        chroma_diff = cv2.absdiff(cb_chan, cr_chan)
        norm_chroma = cv2.normalize(chroma_diff, None, 0, 255, cv2.NORM_MINMAX)
        chroma_colored = cv2.applyColorMap(norm_chroma, cv2.COLORMAP_MAGMA)

        # Encode to base64
        _, buf = cv2.imencode(".jpg", chroma_colored, [cv2.IMWRITE_JPEG_QUALITY, 88])
        chroma_b64 = base64.b64encode(buf).decode("utf-8")

        # Assessment
        if chroma_edge_ratio > 0.35:
            assessment = "ELEVATED_CHROMA_MISMATCH"
            explanation = f"Abnormal chrominance edge energy detected (ratio {chroma_edge_ratio:.3f}). Indicates synthetic recoloring, neural skin transfer, or composite blending."
            score = 35
        elif chroma_edge_ratio > 0.22:
            assessment = "MODERATE_CHROMA_VARIATION"
            explanation = f"Moderate chrominance variation (ratio {chroma_edge_ratio:.3f}). Consistent with minor digital color grading or contrast adjustment."
            score = 65
        else:
            assessment = "UNIFORM_OPTICAL_CHROMINANCE"
            explanation = f"Natural optical sensor chrominance alignment (ratio {chroma_edge_ratio:.3f}). Color channels decay synchronously with luminance."
            score = 92

        return {
            "status": "success",
            "chroma_edge_ratio": round(chroma_edge_ratio, 3),
            "cb_variance": round(var_cb, 1),
            "cr_variance": round(var_cr, 1),
            "assessment": assessment,
            "explanation": explanation,
            "score": score,
            "chroma_heatmap_base64": f"data:image/jpeg;base64,{chroma_b64}"
        }
    except Exception as e:
        return {
            "status": "error",
            "chroma_edge_ratio": 0.0,
            "cb_variance": 0.0,
            "cr_variance": 0.0,
            "assessment": "ANALYSIS_FAILED",
            "explanation": str(e),
            "score": 70,
            "chroma_heatmap_base64": ""
        }
