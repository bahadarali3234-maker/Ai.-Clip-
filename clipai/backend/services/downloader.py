import os
import yt_dlp

class YouTubeDownloader:
    def __init__(self, download_dir: str = "/tmp/clipai"):
        self.download_dir = download_dir
        os.makedirs(download_dir, exist_ok=True)

    def download_video(self, url: str, job_id: str) -> str:
        """
        Downloads a YouTube video in high quality and returns the file path.
        """
        output_tmpl = os.path.join(self.download_dir, f"{job_id}_video.%(ext)s")
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': output_tmpl,
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            # Find the actual filename written (ext could change)
            filename = ydl.prepare_filename(info)
            if not os.path.exists(filename):
                # Search directory for file starting with job_id_video
                for f in os.listdir(self.download_dir):
                    if f.startswith(f"{job_id}_video."):
                        return os.path.join(self.download_dir, f)
            return filename

    def extract_audio(self, video_path: str, job_id: str) -> str:
        """
        Generates a separate wav audio stream for speech-to-text input.
        """
        import ffmpeg
        audio_path = os.path.join(self.download_dir, f"{job_id}_audio.wav")
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, ac=1, ar=16000) # 16kHz Mono as expected by Whisper & Librosa
            .run(quiet=True, overwrite_output=True)
        )
        return audio_path
