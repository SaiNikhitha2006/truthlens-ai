import io
import base64
import numpy as np
import cv2
from PIL import Image, ImageChops, ImageEnhance

COLORMAPS = {
    "turbo": cv2.COLORMAP_TURBO,
    "jet": cv2.COLORMAP_JET,
    "inferno": cv2.COLORMAP_INFERNO,
    "viridis": cv2.COLORMAP_VIRIDIS,
    "bone": cv2.COLORMAP_BONE,
    "ocean": cv2.COLORMAP_OCEAN
}

def perform_ela(image_bytes: bytes, quality: int = 90, scale: int = 20, colormap_name: str = "turbo") -> dict:
    """
    Performs Error Level Analysis (ELA) on an image.
    ELA resaves the image at a specified quality level (default 90%) and compares
    the error rates between the resaved version and original.
    """
    try:
        # Load original image with PIL
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        orig_width, orig_height = original.size

        # Cap max dimensions for fast responsive processing
        max_dim = 1200
        if max(orig_width, orig_height) > max_dim:
            original.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            orig_width, orig_height = original.size

        # Resave as temporary JPEG in memory at specified quality
        quality = max(50, min(99, quality))
        temp_buffer = io.BytesIO()
        original.save(temp_buffer, format="JPEG", quality=quality)
        temp_buffer.seek(0)
        resaved = Image.open(temp_buffer)

        # Compute absolute difference
        ela_diff = ImageChops.difference(original, resaved)

        extrema = ela_diff.getextrema()
        max_diff = max([ex[1] for ex in extrema]) if extrema else 1
        if max_diff == 0:
            max_diff = 1

        # Scale difference for visualization
        scale_factor = scale if scale > 0 else int(255.0 / max_diff)
        enhanced_diff = ImageEnhance.Brightness(ela_diff).enhance(scale_factor)

        # Convert to numpy arrays
        diff_np = np.array(ela_diff, dtype=np.float32)
        diff_gray = cv2.cvtColor(np.array(enhanced_diff), cv2.COLOR_RGB2GRAY)

        mean_error = float(np.mean(diff_np))
        std_error = float(np.std(diff_np))
        peak_error = float(np.max(diff_np))

        # Block-wise variance analysis (32x32 blocks)
        h, w = diff_gray.shape
        block_size = 32
        block_variances = []
        high_discrepancy_blocks = 0
        total_blocks = 0

        for y in range(0, h - block_size + 1, block_size):
            for x in range(0, w - block_size + 1, block_size):
                block = diff_gray[y:y+block_size, x:x+block_size]
                b_var = float(np.var(block))
                block_variances.append(b_var)
                total_blocks += 1

        avg_block_var = float(np.mean(block_variances)) if block_variances else 0.0
        var_std = float(np.std(block_variances)) if block_variances else 0.0
        
        if total_blocks > 0:
            threshold = avg_block_var + 1.8 * var_std
            high_discrepancy_blocks = sum(1 for v in block_variances if v > threshold)
            anomaly_ratio = float(high_discrepancy_blocks / total_blocks)
        else:
            anomaly_ratio = 0.0

        # Select OpenCV Colormap
        cv_map = COLORMAPS.get(colormap_name.lower(), cv2.COLORMAP_TURBO)
        normalized_diff = cv2.normalize(diff_gray, None, 0, 255, cv2.NORM_MINMAX)
        heatmap = cv2.applyColorMap(normalized_diff, cv_map)
        
        # Blend heatmap with grayscale original
        orig_cv = cv2.cvtColor(np.array(original), cv2.COLOR_RGB2BGR)
        orig_gray_3ch = cv2.cvtColor(cv2.cvtColor(orig_cv, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)
        blended = cv2.addWeighted(orig_gray_3ch, 0.45, heatmap, 0.55, 0)

        # Encode visualizations to base64 JPEG
        _, diff_buf = cv2.imencode(".jpg", cv2.cvtColor(np.array(enhanced_diff), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
        diff_base64 = base64.b64encode(diff_buf).decode("utf-8")

        _, heat_buf = cv2.imencode(".jpg", heatmap, [cv2.IMWRITE_JPEG_QUALITY, 90])
        heatmap_base64 = base64.b64encode(heat_buf).decode("utf-8")

        _, blend_buf = cv2.imencode(".jpg", blended, [cv2.IMWRITE_JPEG_QUALITY, 90])
        blended_base64 = base64.b64encode(blend_buf).decode("utf-8")

        # Determine forensic indication
        if anomaly_ratio > 0.18 or var_std > 220:
            assessment = "SUSPICIOUS_SPLICING_DETECTED"
            explanation = (
                f"Significant localized compression error disparity detected (variance std dev: {var_std:.1f}, "
                f"high-error blocks: {anomaly_ratio*100:.1f}%). Distinct regions exhibit non-uniform quantization, "
                "strongly indicating spliced content, digital painting, or AI inpainting overlays."
            )
        elif anomaly_ratio > 0.08 or var_std > 120:
            assessment = "MODERATE_IRREGULARITIES"
            explanation = (
                f"Moderate error level variance detected (std dev: {var_std:.1f}). Minor localized compression "
                "inconsistencies observed; may represent partial editing, text insertion, or mixed recompression."
            )
        else:
            assessment = "UNIFORM_COMPRESSION"
            explanation = (
                f"Uniform error level distribution across the entire frame (variance std dev: {var_std:.1f}, "
                f"mean error: {mean_error:.2f}). Quantization grid displays consistent single-generation degradation."
            )

        return {
            "status": "success",
            "quality_tested": quality,
            "scale_factor": scale_factor,
            "colormap_used": colormap_name,
            "mean_error": round(mean_error, 2),
            "std_error": round(std_error, 2),
            "peak_error": int(peak_error),
            "variance_std": round(var_std, 2),
            "anomaly_ratio_pct": round(anomaly_ratio * 100, 1),
            "assessment": assessment,
            "explanation": explanation,
            "diff_image_base64": f"data:image/jpeg;base64,{diff_base64}",
            "heatmap_image_base64": f"data:image/jpeg;base64,{heatmap_base64}",
            "blended_image_base64": f"data:image/jpeg;base64,{blended_base64}",
            "dimensions": {"width": orig_width, "height": orig_height}
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "quality_tested": quality,
            "scale_factor": scale,
            "colormap_used": colormap_name,
            "mean_error": 0.0,
            "std_error": 0.0,
            "peak_error": 0,
            "variance_std": 0.0,
            "anomaly_ratio_pct": 0.0,
            "assessment": "ANALYSIS_FAILED",
            "explanation": f"Failed to compute ELA: {str(e)}",
            "diff_image_base64": "",
            "heatmap_image_base64": "",
            "blended_image_base64": "",
            "dimensions": {"width": 0, "height": 0}
        }
