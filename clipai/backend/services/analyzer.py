import numpy as np
import librosa
import os

class ClipAnalyzer:
    def __init__(self, clip_duration: float = 30.0):
        self.clip_duration = clip_duration

    def find_best_segment_by_energy(self, audio_path: str) -> tuple[float, float]:
        """
        Uses librosa to find the 30-second block containing peak audio energy (loudness spikes).
        Returns (start_seconds, end_seconds).
        """
        try:
            # Load audio using librosa (16kHz sample rate default)
            y, sr = librosa.load(audio_path, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            
            if duration <= self.clip_duration:
                return 0.0, duration

            # Calculate short-time root-mean-square (RMS) energy
            hop_length = 512
            rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
            times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)

            # Define sliding window step calculations
            window_frames = int((self.clip_duration * sr) / hop_length)
            best_start_idx = 0
            max_energy = 0.0

            # Find window with highest average RMS energy
            for i in range(0, len(rms) - window_frames):
                window_sum = np.sum(rms[i:i + window_frames])
                if window_sum > max_energy:
                    max_energy = window_sum
                    best_start_idx = i

            start_time = float(times[best_start_idx])
            end_time = start_time + self.clip_duration
            
            return start_time, end_time
        except Exception as e:
            print(f"Loudness analysis falloff, defaulting: {e}")
            return 10.0, 40.0

    def find_best_segment_by_transcript_density(self, whisper_segments: list) -> tuple[float, float]:
        """
        Given whisper segments, finds the 30-second window containing the maximum word count density.
        """
        if not whisper_segments:
            return 0.0, 30.0

        # Extract words or structures
        max_words = 0
        best_start = 0.0
        
        # Scan through segments to test windows
        for i, center_seg in enumerate(whisper_segments):
            window_start = center_seg['start']
            window_end = window_start + self.clip_duration
            
            # Count how many other segments or words fall in this window block
            word_count = 0
            for seg in whisper_segments:
                if seg['start'] >= window_start and seg['end'] <= window_end:
                    # Approximation: word count is roughly proportional to text duration or length
                    word_count += len(seg.get('text', '').split())
            
            if word_count > max_words:
                max_words = word_count
                best_start = window_start

        return best_start, best_start + self.clip_duration
