import os
import subprocess

class VideoClipper:
    def __init__(self, output_dir: str = "/tmp/clipai"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def write_srt(self, captions: list, srt_path: str):
        """
        Writes a list of subtitle segments to SRT format.
        """
        with open(srt_path, "w", encoding="utf-8") as f:
            for idx, cap in enumerate(captions):
                start_sec = cap['start']
                end_sec = cap['end']
                text = cap['text']

                # Format timestamps: HH:MM:SS,mmm
                def format_srt_time(sec):
                    hours = int(sec // 3600)
                    minutes = int((sec % 3600) // 60)
                    seconds = int(sec % 60)
                    milliseconds = int((sec % 1) * 1000)
                    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

                f.write(f"{idx + 1}\n")
                f.write(f"{format_srt_time(start_sec)} --> {format_srt_time(end_sec)}\n")
                f.write(f"{text}\n\n")

    def cut_and_burn_captions(
        self, video_path: str, start_time: float, duration: float, captions: list, job_id: str
    ) -> str:
        """
        Slices the video using FFmpeg and burns in the styled subtitles.
        """
        srt_path = os.path.join(self.output_dir, f"{job_id}_subs.srt")
        output_clip_path = os.path.join(self.output_dir, f"{job_id}_clipped.mp4")

        # Create SRT File
        self.write_srt(captions, srt_path)

        if os.path.exists(output_clip_path):
            os.remove(output_clip_path)

        # Style parameters for FFmpeg subtitle burning
        # Bold, White text, centered at the bottom, black outline outline shadow
        subtitle_filter = (
            f"subtitles='{srt_path}':force_style="
            f"'Fontname=Arial,Fontsize=18,PrimaryColour=&H00FFFFFF,"
            f"OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,"
            f"Alignment=2,MarginV=20'"
        )

        cmd = [
            'ffmpeg',
            '-y',
            '-ss', str(start_time),
            '-t', str(duration),
            '-i', video_path,
            '-vf', subtitle_filter,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '22',
            '-c:a', 'aac',
            '-b:a', '128k',
            output_clip_path
        ]

        print(f"Running FFmpeg: {' '.join(cmd)}")
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg failed with exit code {result.returncode}: {result.stderr}")
            
        return output_clip_path
