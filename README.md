# True Lens AI – Detect, Verify, Prevent (v2.0)

**True Lens AI** is an advanced digital forensics platform designed to detect synthetic AI-generated imagery, face-swaps, and localized pixel tampering, verify authentic provenance, and mitigate viral misinformation across social platforms through cryptographic fingerprinting and community governance.

---

## 🔬 Multi-Spectral Forensic Engine

1. **Error Level Analysis (ELA)**:
   - Resaves uploaded media at a standardized 90% JPEG quality matrix (or custom dynamic quality via the Live Tuner).
   - Calculates absolute differences between the original and recompressed frames.
   - Extracts localized block-wise variance ($\sigma_{\text{var}}$) across $32 \times 32$ tiles.
   - Renders dual visualization overlays: **Turbo Colormap Heatmap** and **Spatial Grayscale Blend** to pinpoint spliced text, edited logos, or inpainting boundaries.

2. **Frequency-Based Spectral Analysis (2D FFT)**:
   - Converts the luminance channel to the frequency domain using 2D Fast Fourier Transforms.
   - Computes Azimuthal radial power profiles to compare decay curves against natural optical sensor $1/f$ power laws.
   - Identifies periodic high-frequency checkerboard peaks resulting from transposed convolution or pixel deconvolution layers in GANs (StyleGAN) and Latent Diffusion decoders.

3. **Facial Boundary & Landmark Seam Forensics**:
   - Isolates facial skin-tone ROIs in YCrCb color space.
   - Measures boundary transition gradient ratios to catch Poisson blending / FaceSwap alpha feathering around the jawline.
   - Computes iris & specular reflection highlight symmetry to expose synthetic hyper-symmetry.

4. **Copy-Move Forgery Detection (CMFD)**:
   - Uses ORB feature keypoint matching with spatial Euclidean distance thresholding and displacement vector clustering to highlight cloned, duplicated, or stamped regions.

5. **PRNU Sensor Noise Residual Prints**:
   - Extracts 2D Photo-Response Non-Uniformity (PRNU) camera sensor noise residue using high-pass filtering to verify camera hardware consistency.

6. **Color Space & Chrominance Forensics**:
   - Decomposes YCbCr and LAB channels to detect chrominance edge discrepancies and color bleeding from neural latent decoders.

7. **Composite Trust Score (0–100)**:
   - $100$: Pristine, authentic optical photograph.
   - $0$: High-confidence synthetic AI generation or spliced tampering.
   - Categorized into: `LOW_RISK`, `SUSPICIOUS`, `HIGH_RISK_MANIPULATED`, or `AI_GENERATED` with explicit 94%+ confidence intervals.

---

## 🛡️ The Five Circulation Reduction Mechanisms

| Mechanism | Description | Implementation |
| :--- | :--- | :--- |
| **A. Global Image Fingerprint DB** | Prevents repeated dissemination of confirmed fake media across platforms. | Computes SHA-256 and 64-bit DCT Perceptual Hash (pHash). Fast Hamming distance lookup ($\le 10$ bits) matches near-duplicates under resizing/compression. |
| **B. Cross-Platform Reporting Flow** | Empowers citizens and OSINT researchers to escalate viral misinformation. | Logs reports with platform context (X/Twitter, Reddit, Facebook, TikTok), source URL, reason, and evidence. Provides platform-specific reporting guidance. |
| **C. Platform Partner Integration API** | Enables verified social platforms to query and sync content warnings in real time. | Secure REST endpoints (`POST /api/v1/moderation/flag`, `POST /api/v1/moderation/check-hash`) with API key authentication and webhook callbacks. |
| **D. Global Alerts & Pre-Share Intercept** | Imposes psychological friction and downstream transparency before viral sharing. | Interactive Pre-Share Warning Modal requiring explicit user acknowledgement before sharing, attaching cryptographic TrueLens verification seals. |
| **E. Community Governance & Velocity** | Prioritizes dangerous disinformation outbreaks for human-in-the-loop decisions. | Calculates **Viral Velocity Scores** ($0-100$) and tracks duplicate cluster counts to triage urgent media in the Admin Moderation Portal. |

---

## 🌟 Upgraded v2.0 Features & Capabilities

- **Live Forensic Parameter Tuner**:
  - Interactive sliders for JPEG Quality ($50\% - 98\%$) and Contrast Multiplier ($5\times - 45\times$).
  - Live colormap switcher (Turbo, Jet, Inferno, Viridis, Bone, Ocean).
- **Official Printable Forensic Verification Certificate**:
  - Full-featured tamper-proof certificate with QR code simulation, SHA-256 seal, Trust Index, and 1-click `Print / Save as PDF` (`window.print()`).
- **In-Situ Social Feed Warning Badge Simulator**:
  - Interactive demonstration showing how True Lens partner APIs intercept viral posts on X/Twitter, Reddit, and Instagram feeds with warning overlays.
- **Viral Velocity Dissemination Model**:
  - Recharts area projection model comparing unmitigated viral explosion vs. True Lens friction containment curves over 24 hours.
- **Cybernetic Sound Cues**:
  - Web Audio API synthesizer for scan chirps, anomaly alerts, and verified tones with mute toggle.
- **External Reverse Search Engines**:
  - Direct 1-click launchers for Google Lens, TinEye, Yandex Visual Search, and C2PA Content Authenticity Manifests.

---

## 🚀 Getting Started

### Prerequisites
- **Python**: 3.10+ (tested with Python 3.13)
- **Node.js**: 18+ (tested with Node.js 24)

### Quick Start (Windows)
Double-click `start.bat` or run:
```powershell
.\start.ps1
```

### Manual Execution

#### 1. Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

#### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)
