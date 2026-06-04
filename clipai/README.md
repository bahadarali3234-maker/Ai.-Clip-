# ClipAI — AI-Powered Video Clip Extractor & Editor 🎬

ClipAI makes it incredibly easy to parse, extract, caption, and edit dynamic high-energy video highlights from standard YouTube links.

## 🎯 Key Capabilities
1. **Highlight Detection**: Transcribes audio and utilizes speech intensity/word density thresholds to automatically extract the single most engaging 30-second highlight slot.
2. **Kinetic Caption Burning**: Leverages OpenAI Whisper to identify timed structures and burns styled, bold subtitles directly into the video stream via custom FFmpeg overlays.
3. **Responsive Cinematic Viewer**: Stream preview footage in real-time with dynamically animated subtitles and a visual waveform timeline in a dark, glowing glassmorphism UI.

---

## 📁 Repository Structure
```text
/clipai
  /frontend (React + Tailwind CSS)
    src/
      App.jsx
      components/
        - URLInput.jsx
        - ProgressSteps.jsx
        - VideoPreview.jsx
        - DownloadButton.jsx
  /backend (FastAPI + Python Core)
    main.py
    services/
      - downloader.py   # yt-dlp integrations
      - analyzer.py     # Peak engagement detection
      - clipper.py      # FFmpeg slicer
      - captioner.py    # OpenAI Whisper model
  requirements.txt
  package.json
  README.md
```

---

## 🛠️ Installation & Setup (Local)

### 1. Prerequisites
Ensure you have the following system utilities installed on your local computer:
*   **Python 3.9+**
*   **Node.js 18+**
*   **FFmpeg** (Required globally in system paths for clipper services)

### 2. Run Python Backend
1. Navigate directory:
    ```bash
    cd clipai/backend
    ```
2. Set up virtual environment & install requirements:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r ../requirements.txt
    ```
3. Boot the API server:
    ```bash
    python main.py
    ```
    The FastAPI backend will now be active on `http://localhost:8000`.

### 3. Run React Frontend
1. Navigate to frontend directory or root:
    ```bash
    cd clipai
    npm install
    # Set proxy back to http://localhost:8000 in vite.config
    npm run dev
    ```
    The React UI will run locally on `http://localhost:3000`.

---

## 🚀 Cloud Deployment Guide

### Deployment A: Backend (Railway / Render)
1. **Railway**: Import this repository. Railway automatically detects the root `requirements.txt` and provisions Docker/Python container execution.
2. **FFmpeg configuration**: On Render or Railway, ensure you add the **FFmpeg Buildpack** or specify a Dockerfile that includes `apt-get install -y ffmpeg` so that subtitle filters compile correctly.
3. Set your environment ports to bind to host `0.0.0.0` on port `$PORT`.

### Deployment B: Frontend (Vercel / Netlify)
1. Import the `/clipai` folder to Vercel.
2. Specify build command `npm run build` and output directory `dist`.
3. Set environment variables to proxy `/api` URLs back to your deployed Railway backend domain.
