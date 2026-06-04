from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import os
import threading

# Import local services
from services.downloader import YouTubeDownloader
from services.analyzer import ClipAnalyzer
from services.clipper import VideoClipper
from services.captioner import AudioCaptioner

app = FastAPI(title="ClipAI Backend API", description="AI-powered video clip extractor")

# Enable CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job db
jobs = {}

class ProcessRequest(BaseModel):
    url: str

# Initialize services
downloader = YouTubeDownloader()
analyzer = ClipAnalyzer()
clipper = VideoClipper()
# Lazy loading model: will initialize on first transcription call
captioner = AudioCaptioner(model_size="base")

def background_processing_task(job_id: str, url: str):
    try:
        # Step 1: Downloading
        jobs[job_id]["step"] = 1
        jobs[job_id]["progress"] = 10
        video_path = downloader.download_video(url, job_id)
        
        jobs[job_id]["progress"] = 30
        audio_path = downloader.extract_audio(video_path, job_id)

        # Step 2: Extracting/transcribing
        jobs[job_id]["step"] = 2
        jobs[job_id]["progress"] = 45
        
        # Transcribe audio using Whisper
        raw_captions = captioner.generate_captions(audio_path)

        # Step 3: AI finding best 30s highlight clip window
        jobs[job_id]["step"] = 3
        jobs[job_id]["progress"] = 65
        
        best_start, best_end = analyzer.find_best_segment_by_transcript_density(raw_captions)
        duration = 30.0

        # Adjust captions offsets relative to the 30-second start window
        clipped_captions = []
        for cap in raw_captions:
            if cap['start'] >= best_start and cap['end'] <= best_end:
                clipped_captions.append({
                    "text": cap['text'],
                    "start": cap['start'] - best_start,
                    "end": cap['end'] - best_start
                })

        # Step 5: Cutting and burning subtitles using FFmpeg
        jobs[job_id]["step"] = 4
        jobs[job_id]["progress"] = 80
        clipped_video = clipper.cut_and_burn_captions(
            video_path, best_start, duration, clipped_captions, job_id
        )

        jobs[job_id]["progress"] = 95
        jobs[job_id]["step"] = 5

        # Finalize
        jobs[job_id]["progress"] = 100
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = {
            "title": f"Viral Highlight Clip - {job_id[:6]}",
            "best_start": f"{int(best_start//60):02d}:{int(best_start%60):02d}",
            "best_end": f"{int(best_end//60):02d}:{int(best_end%60):02d}",
            "explanation": "Detected peak verbal activity density and key conversational hooks using Whisper audio frame analysis.",
            "captions": clipped_captions,
            "filepath": clipped_video
        }

    except Exception as e:
        print(f"Exception while running pipeline for job {job_id}: {e}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@app.post("/api/process")
async def process_video(req: ProcessRequest, background_tasks: BackgroundTasks):
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    
    jobs[job_id] = {
        "status": "processing",
        "step": 1,
        "progress": 5,
        "error": None,
        "result": None
    }
    
    background_tasks.add_task(background_processing_task, job_id, req.url)
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    
    # Hide server file system absolute paths from output payload
    result_payload = None
    if job["status"] == "completed" and job["result"]:
        result_payload = {
            "video_url": f"/api/download/{job_id}",
            "title": job["result"]["title"],
            "best_start": job["result"]["best_start"],
            "best_end": job["result"]["best_end"],
            "explanation": job["result"]["explanation"],
            "captions": job["result"]["captions"]
        }

    return {
        "status": job["status"],
        "step": job["step"],
        "progress": job["progress"],
        "error": job["error"],
        "result": result_payload
    }


@app.get("/api/download/{job_id}")
async def download_clip(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = jobs[job_id]
    if job["status"] != "completed" or not job["result"]:
        raise HTTPException(status_code=400, detail="Clip generation is not complete or failed")

    filepath = job["result"]["filepath"]
    if not os.path.exists(filepath):
         raise HTTPException(status_code=410, detail="File has expired or was removed from cache")

    return FileResponse(
        filepath, 
        media_type="video/mp4", 
        filename=f"clipai_{job_id}.mp4"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
