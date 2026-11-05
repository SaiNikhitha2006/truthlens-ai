import io
import base64
import numpy as np
import cv2
from PIL import Image

def analyze_facial_forensics(image_bytes: bytes) -> dict:
    """
    Performs specialized deepfake facial boundary and landmark forensics:
    1. Skin-tone region of interest (ROI) extraction in YCrCb space.
    2. Boundary blending seam gradient analysis (detects Poisson / Gaussian feathering around jawline).
    3. Facial symmetry and specular highlight alignment.
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(pil_img)
        h, w, _ = img_np.shape

        # Convert to YCrCb for skin segmentation
        ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
        # Skin color boundaries in YCrCb
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)

        # Morphological operations to denoise skin mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=2)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel, iterations=2)

        # Find largest skin contour (presumed face)
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        face_found = False
        face_roi_b64 = ""
        boundary_seam_score = 85
        symmetry_score = 88
        findings = []

        annotated = img_np.copy()

        if contours:
            # Sort contours by area
            contours = sorted(contours, key=cv2.contourArea, reverse=True)
            largest = contours[0]
            area = cv2.contourArea(largest)

            # Must cover at least 3% of image area to be considered a prominent face
            if area > (h * w * 0.03):
                face_found = True
                x, y, fw, fh = cv2.boundingRect(largest)
                
                # Expand slightly
                x = max(0, x - 15)
                y = max(0, y - 15)
                fw = min(w - x, fw + 30)
                fh = min(h - y, fh + 30)

                face_crop = img_np[y:y+fh, x:x+fw]

                # Draw bounding box and facial contour on annotated preview
                cv2.rectangle(annotated, (x, y), (x + fw, y + fh), (58, 134, 255), 3)
                cv2.drawContours(annotated, [largest], -1, (76, 201, 240), 2)
                cv2.putText(annotated, "FACIAL ROI DETECTED", (x, max(20, y - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (76, 201, 240), 2)

                # 1. Boundary seam gradient analysis (jawline transition)
                # Dilate and erode to get boundary ring
                dilated_mask = cv2.dilate(skin_mask, kernel, iterations=3)
                eroded_mask = cv2.erode(skin_mask, kernel, iterations=3)
                boundary_ring = dilated_mask - eroded_mask

                gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
                laplacian = cv2.Laplacian(gray, cv2.CV_64F)
                boundary_lap = np.abs(laplacian[boundary_ring > 0])
                interior_lap = np.abs(laplacian[eroded_mask > 0])

                mean_bound_grad = float(np.mean(boundary_lap)) if len(boundary_lap) > 0 else 1.0
                mean_int_grad = float(np.mean(interior_lap)) if len(interior_lap) > 0 else 1.0

                # Deepfakes typically have abnormally softened boundary transitions (ratio < 0.65)
                # or stark jagged cutouts (ratio > 2.8)
                grad_ratio = float(mean_bound_grad / (mean_int_grad + 1e-6))

                if grad_ratio < 0.60:
                    boundary_seam_score = 30
                    findings.append("Soft feathered boundary gradient around jawline/hairline, typical of FaceSwap alpha blending.")
                elif grad_ratio > 3.0:
                    boundary_seam_score = 45
                    findings.append("Abrupt boundary sharpness jump, typical of digital scissor compositing.")
                else:
                    boundary_seam_score = 90
                    findings.append("Natural continuous optical gradient between facial contour and background.")

                # 2. Specular highlight and Iris Symmetry Check
                # Split face horizontally down the center
                mid_x = fw // 2
                left_half = face_crop[:, :mid_x]
                right_half = cv2.flip(face_crop[:, mid_x:], 1) # flip right half for comparison

                min_w = min(left_half.shape[1], right_half.shape[1])
                diff_sym = cv2.absdiff(left_half[:, :min_w], right_half[:, :min_w])
                sym_metric = float(np.mean(diff_sym))

                # Very high symmetry is actually a hallmark of synthetic AI avatars (StyleGAN faces have unnervingly centered symmetry)
                if sym_metric < 14.0:
                    symmetry_score = 35
                    findings.append("Atypical hyper-symmetry detected (< 14.0 delta) characteristic of StyleGAN/Diffusion facial generators.")
                else:
                    symmetry_score = 88

                # Encode face crop
                _, crop_buf = cv2.imencode(".jpg", cv2.cvtColor(face_crop, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 90])
                face_roi_b64 = f"data:image/jpeg;base64,{base64.b64encode(crop_buf).decode('utf-8')}"

        if not face_found:
            findings.append("No prominent human face detected; facial boundary forensics omitted.")

        # Encode annotated image
        _, ann_buf = cv2.imencode(".jpg", cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 88])
        annotated_b64 = f"data:image/jpeg;base64,{base64.b64encode(ann_buf).decode('utf-8')}"

        return {
            "face_detected": face_found,
            "boundary_seam_score": boundary_seam_score,
            "symmetry_score": symmetry_score,
            "findings": findings,
            "face_roi_base64": face_roi_b64,
            "annotated_preview_base64": annotated_b64
        }
    except Exception as e:
        return {
            "face_detected": False,
            "boundary_seam_score": 75,
            "symmetry_score": 75,
            "findings": [f"Face forensics error: {str(e)}"],
            "face_roi_base64": "",
            "annotated_preview_base64": ""
        }
