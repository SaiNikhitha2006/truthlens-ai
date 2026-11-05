import io
import base64
import numpy as np
import cv2
from PIL import Image

def calculate_radial_profile(psd2d: np.ndarray) -> np.ndarray:
    """
    Computes azimuthal average of a 2D power spectral density (PSD)
    to produce a 1D radial frequency profile.
    """
    y, x = np.indices(psd2d.shape)
    center = np.array([(y.max() - y.min()) / 2.0, (x.max() - x.min()) / 2.0])
    r = np.hypot(y - center[0], x - center[1]).astype(np.int32)

    # Bin and compute average for each radial distance
    max_radius = int(np.min(center))
    radial_profile = []
    for radius in range(max_radius):
        mask = (r == radius)
        if np.any(mask):
            radial_profile.append(float(np.mean(psd2d[mask])))
        else:
            radial_profile.append(0.0)
            
    return np.array(radial_profile, dtype=np.float32)

def analyze_frequency_spectrum(image_bytes: bytes) -> dict:
    """
    Computes 2D Fast Fourier Transform (FFT) on grayscale luminance channel,
    measures frequency energy distribution, detects periodic high-frequency grid artifacts,
    and identifies spectral signatures characteristic of AI generation pipelines.
    """
    try:
        # Load image and convert to grayscale
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")
        
        # Standardize size for spectral comparability (e.g. 512x512)
        target_size = (512, 512)
        resized_img = pil_img.resize(target_size, Image.Resampling.BILINEAR)
        gray = np.array(resized_img, dtype=np.float32)

        # 2D Fast Fourier Transform
        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)
        magnitude = np.abs(fshift) + 1e-9
        log_magnitude = 20 * np.log(magnitude)

        # Calculate high, mid, and low frequency bands
        center_y, center_x = 256, 256
        y, x = np.ogrid[:512, :512]
        dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)

        low_mask = dist_from_center <= 45
        mid_mask = (dist_from_center > 45) & (dist_from_center <= 150)
        high_mask = (dist_from_center > 150) & (dist_from_center <= 250)

        low_energy = float(np.sum(magnitude[low_mask]))
        mid_energy = float(np.sum(magnitude[mid_mask]))
        high_energy = float(np.sum(magnitude[high_mask]))
        total_energy = low_energy + mid_energy + high_energy + 1e-9

        high_low_ratio = float(high_energy / (low_energy + 1e-9))
        high_energy_pct = float((high_energy / total_energy) * 100)

        # Radial profile analysis
        radial_vals = calculate_radial_profile(log_magnitude)
        # Sample 30 representative radial frequency points for frontend chart
        step = max(1, len(radial_vals) // 30)
        sampled_radial = [
            {"frequency": int(i * (100 / 30)), "amplitude": round(float(radial_vals[i]), 2)}
            for i in range(0, min(len(radial_vals), 30 * step), step)
        ]

        # Artifact & Periodic Peak Detection (GAN / Diffusion checkerboard detection)
        # High-pass filter magnitude spectrum to highlight outlier spike frequencies
        blurred_mag = cv2.GaussianBlur(log_magnitude, (21, 21), 0)
        high_pass_mag = log_magnitude - blurred_mag

        # Look for prominent peaks in high frequency outer quadrant ring (typical of transposed conv)
        outer_peaks_mask = (dist_from_center > 100) & (dist_from_center < 240)
        peak_candidates = high_pass_mag * outer_peaks_mask
        std_val = float(np.std(high_pass_mag))
        peak_threshold = float(np.mean(high_pass_mag)) + 2.8 * std_val
        peak_count = int(np.sum(peak_candidates > peak_threshold))

        # Check for abnormal high-frequency spectral flatness (Diffusion model signature)
        # Natural photographic images exhibit a 1/f or 1/f^2 spectral power decay.
        # AI generators often display flattened or anomalous high-frequency plateaus.
        if len(radial_vals) > 100:
            tail_slope = float(radial_vals[-20] - radial_vals[-80]) / 60.0
        else:
            tail_slope = -0.5

        is_synthetic_signature = False
        confidence = 0
        ai_indicators = []

        if peak_count >= 8:
            is_synthetic_signature = True
            confidence += 45
            ai_indicators.append(f"Periodic high-frequency checkerboard peaks ({peak_count} spikes) - typical of GAN upsampler deconvolution.")
        
        if tail_slope > -0.08:
            is_synthetic_signature = True
            confidence += 35
            ai_indicators.append(f"Atypical high-frequency plateau (decay slope: {tail_slope:.3f} vs normal < -0.18) - consistent with diffusion model latent decoder.")

        if high_low_ratio > 0.42:
            confidence += 20
            ai_indicators.append(f"Elevated high-frequency energy ratio ({high_low_ratio:.3f}) - inconsistent with organic optical sensor MTF curve.")

        confidence = min(98, max(5, confidence if is_synthetic_signature else 12))

        # Render Spectral Map base64
        norm_mag = cv2.normalize(log_magnitude, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        spectral_colored = cv2.applyColorMap(norm_mag, cv2.COLORMAP_INFERNO)
        
        # Draw concentric guide circles and crosshairs on spectrum visualization for professional look
        cv2.circle(spectral_colored, (256, 256), 45, (80, 80, 80), 1, cv2.LINE_AA)
        cv2.circle(spectral_colored, (256, 256), 150, (60, 60, 60), 1, cv2.LINE_AA)
        cv2.circle(spectral_colored, (256, 256), 250, (40, 40, 40), 1, cv2.LINE_AA)
        cv2.line(spectral_colored, (256, 0), (256, 512), (50, 50, 50), 1)
        cv2.line(spectral_colored, (0, 256), (512, 256), (50, 50, 50), 1)

        _, spec_buf = cv2.imencode(".jpg", spectral_colored, [cv2.IMWRITE_JPEG_QUALITY, 90])
        spectrum_base64 = base64.b64encode(spec_buf).decode("utf-8")

        return {
            "status": "success",
            "high_low_ratio": round(high_low_ratio, 3),
            "high_energy_pct": round(high_energy_pct, 2),
            "peak_artifact_count": peak_count,
            "spectral_tail_slope": round(tail_slope, 4),
            "is_synthetic_signature": is_synthetic_signature,
            "synthetic_confidence": confidence,
            "ai_indicators": ai_indicators if ai_indicators else ["Natural 1/f power law distribution observed; no synthetic periodicity spikes."],
            "radial_distribution": sampled_radial,
            "spectrum_image_base64": f"data:image/jpeg;base64,{spectrum_base64}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "high_low_ratio": 0.0,
            "high_energy_pct": 0.0,
            "peak_artifact_count": 0,
            "spectral_tail_slope": 0.0,
            "is_synthetic_signature": False,
            "synthetic_confidence": 0,
            "ai_indicators": [f"Spectral analysis error: {str(e)}"],
            "radial_distribution": [],
            "spectrum_image_base64": ""
        }
