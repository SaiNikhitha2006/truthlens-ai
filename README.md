# True Lens AI – Detect, Verify, Prevent

**True Lens AI** is an advanced digital forensics platform designed to detect synthetic AI-generated imagery, face-swaps, and localized pixel tampering, verify authentic provenance, and mitigate viral misinformation across social platforms through cryptographic fingerprinting and community governance.

---

## 🔬 Core Forensics & AI Detection Engine

True Lens AI employs a multi-spectral forensic stack to evaluate images without relying solely on opaque, easily bypassed black-box classifiers:

1. **Error Level Analysis (ELA)**:
   - Resaves uploaded media at a standardized 90% JPEG quality matrix.
   - Calculates absolute differences between the original and recompressed frames.
   - Extracts localized block-wise variance ($\sigma_{\text{var}}$) across $32 \times 32$ tiles.
   - Renders dual visualization overlays: **Turbo Colormap Heatmap** and **Spatial Grayscale Blend** to pinpoint spliced text, edited logos, or inpainting boundaries.

2. **Frequency-Based Spectral Analysis (2D FFT)**:
   - Converts the luminance channel to the frequency domain using 2D Fast Fourier Transforms.
   - Computes Azimuthal radial power profiles to compare decay curves against natural optical sensor $1/f$ power laws.
   - Identifies periodic high-frequency checkerboard peaks resulting from transposed convolution or pixel deconvolution layers in GANs (StyleGAN) and Latent Diffusion decoders.

3. **Face & Manipulation Anomaly Engine**:
   - **Sensor Noise Residue (PRNU)**: Analyzes high-pass residuals across spatial quadrants to verify uniform camera sensor noise.
   - **Edge & Blur Consistency**: Computes Laplacian variance across gradient boundaries to flag soft synthetic skin smoothing vs. sharp natural optical backgrounds.
   - **Metadata & EXIF Audit**: Inspects hardware tags, camera makes, and known generative AI tool signatures.

4. **Composite Trust Score (0–100)**:
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

## 🎨 UI & Design Architecture

- **Theme**: Professional Cybersecurity Dark Mode
  - **Navy Primary**: `#0b132b`
  - **Deep Slate**: `#1c2541`
  - **Electric Blue**: `#3a86ff`
  - **Cyan Accent**: `#4cc9f0`
- **Interactive Forensic Split-View**:
  - Drag-to-wipe horizontal split slider
  - Side-by-side comparison mode
  - Alpha blend overlay with real-time opacity controls
- **Interactive Dashboards**:
  - Live system stats ticker and critical outbreak alerts
  - 1-Click Forensic Benchmark sample images (Authentic, AI-Generated, Doctored Document)
  - Interactive Recharts Azimuthal frequency profile chart
  - Admin governance and triage console

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

---

## 📁 Repository Directory Structure

```
true-lens-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app with CORS and v1 router bindings
│   │   ├── config.py            # Platform configuration and CORS settings
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── forensics.py # Image upload, URL analyze, sample benchmarks
│   │   │       ├── moderation.py# Check-hash and flag endpoints for partner platforms
│   │   │       ├── reports.py   # Community reporting & duplicate tracking
│   │   │       ├── partners.py  # Partner platform credentials and webhook dispatch
│   │   │       ├── alerts.py    # Global outbreak alerts & topic subscriptions
│   │   │       └── stats.py     # Real-time metrics and aggregates
│   │   ├── core/
│   │   │   ├── ela.py           # 90% JPEG quality Error Level Analysis & Turbo Heatmaps
│   │   │   ├── spectral.py      # 2D Fast Fourier Transform & Azimuthal radial profile
│   │   │   ├── anomaly.py       # PRNU noise variance, Laplacian edges, Trust Score
│   │   │   ├── hasher.py        # SHA-256 and 64-bit DCT pHash (Hamming distance)
│   │   │   └── samples.py       # Programmatic forensic benchmark samples
│   │   └── db/
│   │       ├── database.py      # JSON-backed persistent database engine
│   │       ├── models.py        # Pydantic data schemas
│   │       └── seed.py          # Pre-seeded viral disinfo reports and partners
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Sticky navigation with live outbreak badge
│   │   │   ├── Footer.tsx            # Standards, disclaimers, and cryptographic notes
│   │   │   ├── TrustScoreGauge.tsx   # Dynamic SVG needle gauge (0-100) & risk pill
│   │   │   ├── ImageSplitView.tsx    # Wipe split, side-by-side, and blend viewer
│   │   │   ├── ElaVisualizer.tsx     # ELA colormap, delta metrics, block variance
│   │   │   ├── SpectralVisualizer.tsx# 2D FFT map + Recharts Azimuthal curve
│   │   │   ├── PreShareModal.tsx     # Mandatory pre-share friction intercept dialog
│   │   │   ├── SampleImagePicker.tsx # 1-Click benchmark sample selector
│   │   │   ├── ReportCard.tsx        # Clustered duplicate card with viral velocity
│   │   │   └── AlertBadge.tsx        # Severity pill
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # Platform overview, stats, mechanism architecture
│   │   │   ├── ScanPage.tsx          # Drag-and-drop file / URL forensic scanner
│   │   │   ├── ReportDetailsPage.tsx # Multi-spectral verification dossier & export
│   │   │   ├── CommunityFeedPage.tsx # Flagged feed & platform reporting guides
│   │   │   ├── AdminPortalPage.tsx   # Triage queue, webhook dispatch, DB sync
│   │   │   ├── PartnerApiPage.tsx    # Interactive endpoint tester & partner setup
│   │   │   └── NotificationsPage.tsx # Outbreak alerts & specialized subscriptions
│   │   ├── services/
│   │   │   └── api.ts               # Typed REST API service connector
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript definitions
│   │   ├── App.tsx                  # Core state controller & router
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind directives & dark theme styling
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── start.bat
├── start.ps1
└── README.md
```

---

## ⚖️ Open Governance & Ethical Compliance Notice
True Lens AI operates under decentralized open verification standards. Unpartnered third-party platforms cannot be forcibly altered without bilateral API agreements and cryptographic trust federation.
