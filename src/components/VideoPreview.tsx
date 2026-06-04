import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Monitor, Type as FontIcon, Sparkles } from "lucide-react";
import { Subtitle } from "../types";

interface VideoPreviewProps {
  videoUrl: string;
  title: string;
  explanation: string;
  bestStart: string;
  bestEnd: string;
  captions: Subtitle[];
}

type CaptionStyle = "classic-white" | "shorts-yellow" | "tiktok-pop" | "neon-glow";

export function VideoPreview({
  videoUrl,
  title,
  explanation,
  bestStart,
  bestEnd,
  captions,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeCaption, setActiveCaption] = useState<string | null>(null);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("classic-white");

  // Track active subtitle text based on current video time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Find if current time falls within any caption timing range
    const currentCaption = captions.find(
      (cap) => time >= cap.start && time <= cap.end
    );
    setActiveCaption(currentCaption ? currentCaption.text : null);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => console.log("Video play interrupted:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch((err) => console.log(err));
    setIsPlaying(true);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 30);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Autoplay video when results are ready
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          // Browser block autoplay fallback
          setIsPlaying(false);
        });
    }
  }, [videoUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl mx-auto"
      id="video-preview-panel"
    >
      {/* Video Canvas Section */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="relative group rounded-3xl bg-black border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] aspect-video">
          
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            loop
            className="w-full h-full object-cover cursor-pointer"
            id="preview-video-element"
            crossOrigin="anonymous"
          />

          {/* Dynamic burned-in captions HUD wrapper */}
          <div className="absolute inset-x-0 bottom-16 pointer-events-none z-20 flex justify-center px-6">
            <AnimatePresence mode="wait">
              {activeCaption && (
                <motion.div
                  key={activeCaption}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-center font-sans"
                >
                  {captionStyle === "classic-white" && (
                    <span 
                      className="text-white font-black text-lg md:text-xl px-4 py-1 rounded bg-[#000000]/75 tracking-wide leading-tight uppercase font-sans border border-white/10"
                      style={{ textShadow: "2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000" }}
                    >
                      {activeCaption}
                    </span>
                  )}

                  {captionStyle === "shorts-yellow" && (
                    <span 
                      className="text-yellow-400 font-extrabold text-xl md:text-2xl tracking-normal leading-tight font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                      style={{ textShadow: "3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000" }}
                    >
                      🔥 {activeCaption.toUpperCase()} 🔥
                    </span>
                  )}

                  {captionStyle === "tiktok-pop" && (
                    <span 
                      className="bg-white text-black font-extrabold text-base md:text-lg px-3 py-1.5 rounded-lg border-2 border-black tracking-normal leading-tight font-sans shadow-[4px_4px_0px_#7c3aed]"
                    >
                      {activeCaption}
                    </span>
                  )}

                  {captionStyle === "neon-glow" && (
                    <span 
                      className="text-fuchsia-400 font-bold text-lg md:text-xl tracking-wider leading-tight font-mono filter drop-shadow-[0_0_10px_#ec4899] uppercase"
                    >
                      {activeCaption}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player controls bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex items-center justify-between gap-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600/90 text-white hover:bg-violet-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                id="play-pause-btn"
                title="Play/Pause"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                id="restart-time-btn"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Seeking track timeline */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400 select-none">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 30}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none"
              />
              <span className="text-[10px] font-mono text-gray-400 select-none">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                id="mute-unmute-btn"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Captions Style Selector Box */}
        <div className="bg-[#0f0f15]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5 font-mono">
            <FontIcon className="w-4 h-4 text-violet-400" />
            BurnCaption Style:
          </span>

          <div className="flex flex-wrap gap-2">
            {(["classic-white", "shorts-yellow", "tiktok-pop", "neon-glow"] as CaptionStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setCaptionStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium cursor-pointer transition-all border ${
                  captionStyle === style
                    ? "bg-violet-600/20 border-violet-500 text-white font-semibold"
                    : "bg-[#14141e] border-white/5 text-gray-400 hover:text-white"
                }`}
                id={`caption-style-option-${style}`}
              >
                {style.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights Analysis Description Segment */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]">
              AI Segment Match
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug pt-1">
              {title}
            </h3>
            <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
              <span className="text-violet-400">Time window:</span> 
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {bestStart} - {bestEnd} (30s)
              </span>
            </p>
          </div>

          {/* Expert explanation */}
          <div className="p-5 rounded-2xl bg-[#0f0f15]/80 border border-white/5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Monitor className="w-3.5 h-3.5 text-violet-400" />
              Engagement Analyzer Report
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed font-sans">
              {explanation}
            </p>
          </div>

          {/* Subtitles Timeline Logs list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Captions Timeline logs ({captions.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {captions.map((cap, i) => {
                const isActive = currentTime >= cap.start && currentTime <= cap.end;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = cap.start;
                        setCurrentTime(cap.start);
                        if (!isPlaying) togglePlay();
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left gap-3 group/cap cursor-pointer transition-all ${
                      isActive
                        ? "bg-violet-600/15 border-violet-500/50 text-white"
                        : "bg-[#0b0b10] border-white/5 text-gray-400 hover:bg-[#11111a]/50 hover:text-white"
                    }`}
                    id={`caption-item-${i}`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-xs truncate ${isActive ? "font-semibold" : ""}`}>
                        {cap.text}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 group-hover/cap:text-violet-400 shrink-0">
                      {formatTime(cap.start)} - {formatTime(cap.end)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Format Seconds -> MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
