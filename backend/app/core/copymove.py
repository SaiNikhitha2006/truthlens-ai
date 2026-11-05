import io
import base64
import numpy as np
import cv2
from PIL import Image

def detect_copy_move(image_bytes: bytes, min_keypoints: int = 400) -> dict:
    """
    Detects Copy-Move Forgery (cloned image regions) using ORB feature descriptor matching.
    Matches keypoints across distinct spatial coordinates to detect duplicated/cloned regions
    used to duplicate people/objects or conceal evidence.
    """
    try:
        # Load grayscale image
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(pil_img)
        h, w, _ = img_np.shape
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

        # Scale down large images for fast responsive analysis
        max_dim = 900
        scale = 1.0
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            img_np = cv2.resize(img_np, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        # ORB feature extractor
        orb = cv2.ORB_create(nfeatures=1200, scaleFactor=1.2, nlevels=8, edgeThreshold=15)
        keypoints, descriptors = orb.detectAndCompute(gray, None)

        if descriptors is None or len(descriptors) < 20:
            return {
                "detected": False,
                "cloned_cluster_count": 0,
                "confidence_score": 10,
                "explanation": "Insufficient unique feature keypoints found in uniform texture.",
                "visual_base64": ""
            }

        # BFMatcher with Hamming distance
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        # Find 2 nearest neighbors for ratio test
        matches = matcher.knnMatch(descriptors, descriptors, k=3)

        # Filter self-matches and nearby keypoints (must be separated by spatial distance > 45px)
        min_spatial_dist = 40 * scale
        good_matches = []
        canvas = img_np.copy()

        for m_list in matches:
            if len(m_list) >= 2:
                # 1st match is usually self (distance 0), 2nd is nearest neighbor
                m = m_list[1] if m_list[0].distance == 0 else m_list[0]
                pt1 = keypoints[m.queryIdx].pt
                pt2 = keypoints[m.trainIdx].pt
                spatial_dist = np.hypot(pt1[0] - pt2[0], pt1[1] - pt2[1])

                # Distance ratio and spatial separation check
                if m.distance < 45 and spatial_dist > min_spatial_dist:
                    good_matches.append((pt1, pt2, m.distance))

        # Cluster parallel displacement vectors
        vectors = []
        for pt1, pt2, dist in good_matches:
            dx = pt2[0] - pt1[0]
            dy = pt2[1] - pt1[1]
            vectors.append((dx, dy))

        cloned_pairs = []
        if len(vectors) > 4:
            # Group vectors with similar angle and magnitude
            angles = [np.arctan2(v[1], v[0]) for v in vectors]
            mags = [np.hypot(v[0], v[1]) for v in vectors]

            for i in range(len(vectors)):
                similar_count = sum(
                    1 for j in range(len(vectors))
                    if i != j and abs(angles[i] - angles[j]) < 0.25 and abs(mags[i] - mags[j]) < 25
                )
                if similar_count >= 2:
                    cloned_pairs.append(good_matches[i])

        # Draw detected cloning lines and circles
        detected = len(cloned_pairs) >= 3
        if detected:
            for pt1, pt2, _ in cloned_pairs:
                p1 = (int(pt1[0]), int(pt1[1]))
                p2 = (int(pt2[0]), int(pt2[1]))
                cv2.circle(canvas, p1, 5, (0, 255, 255), 2)
                cv2.circle(canvas, p2, 5, (0, 0, 255), 2)
                cv2.line(canvas, p1, p2, (255, 75, 50), 2, cv2.LINE_AA)
            explanation = f"Detected {len(cloned_pairs)} correlated keypoint pairs with parallel displacement vectors, indicating cloned or duplicated image regions."
            confidence = min(96, 60 + len(cloned_pairs) * 4)
        else:
            explanation = "No statistically significant cloned keypoint clusters detected; texture displays natural random distribution."
            confidence = 15

        # Encode canvas to base64
        canvas_bgr = cv2.cvtColor(canvas, cv2.COLOR_RGB2BGR)
        _, buf = cv2.imencode(".jpg", canvas_bgr, [cv2.IMWRITE_JPEG_QUALITY, 88])
        visual_b64 = base64.b64encode(buf).decode("utf-8")

        return {
            "detected": detected,
            "cloned_cluster_count": len(cloned_pairs),
            "confidence_score": confidence,
            "explanation": explanation,
            "visual_base64": f"data:image/jpeg;base64,{visual_b64}"
        }
    except Exception as e:
        return {
            "detected": False,
            "cloned_cluster_count": 0,
            "confidence_score": 0,
            "explanation": f"Copy-move evaluation skipped: {str(e)}",
            "visual_base64": ""
        }
