import whisper

class AudioCaptioner:
    def __init__(self, model_size: str = "base"):
        self.model_size = model_size
        self._model = None

    @property
    def model(self):
        if self._model is None:
            # Lazy load the OpenAI Whisper model to conserve memory
            self._model = whisper.load_model(self.model_size)
        return self._model

    def generate_captions(self, audio_path: str) -> list[dict]:
        """
        Transcribes the audio file and returns clean timed caption segments.
        Structure: [ { "text": "...", "start": 0.0, "end": 2.5 }, ... ]
        """
        result = self.model.transcribe(audio_path, task="transcribe", word_timestamps=True)
        segments = []
        
        for seg in result.get("segments", []):
            segments.append({
                "text": seg.get("text", "").strip(),
                "start": float(seg.get("start", 0.0)),
                "end": float(seg.get("end", 0.0)),
            })
            
        return segments
