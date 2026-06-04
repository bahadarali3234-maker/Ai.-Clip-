import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Monitor, Type as FontIcon, Sparkles } from "lucide-react";

export function VideoPreview({
  videoUrl,
  title,
  explanation,
  bestStart,
  bestEnd,
  captions,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeCaption, setActiveCaption] = useState(null);
  const [captionStyle, setCaptionStyle] = useState("classic-white");

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

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
      videoRef.current.play().catch(() => {});
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
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [videoUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl mx-auto"
    >
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="relative group rounded-3xl bg-black border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 30)}
            onClick={togglePlay}
            loop
            className="w-full h-full object-cover cursor-pointer"
          />

          <div className="absolute inset-x-0 bottom-16 pointer-events-none z-20 flex justify-center px-6">
            <AnimatePresence mode="wait">
              {activeCaption && (
                <motion.div
                  key={activeCaption}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="text-center"
                >
                  {captionStyle === "classic-white" && (
                    <span 
                      className="text-white font-black text-lg md:text-xl px-4 py-1 rounded bg-[#000000]/75 tracking-wide leading-tight uppercase font-sans border border-white/10"
                      style={{ textShadow: "2px 2px 0px #000000, -2px -2px 0px #000000" }}
                    >
                      {activeCaption}
                    </span>
                  )}
                  {captionStyle === "shorts-yellow" && (
                    <span 
                      className="text-yellow-400 font-extrabold text-xl md:text-2xl tracking-normal leading-tight font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                      style={{ textShadow: "2px 2px 0px #000" }}
                    >
                      🔥 {activeCaption.toUpperCase()} 🔥
                    </span>
                  )}
                  {captionStyle === "tiktok-pop" && (
                    <span className="bg-white text-black font-extrabold text-base md:text-lg px-3 py-1.5 rounded-lg border-2 border-black shadow-[4px_4px_0px_#7c3aed]">
                      {activeCaption}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex items-center justify-between gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600/90 text-white hover:bg-violet-500 transition-all cursor-pointer">
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <button onClick={handleRestart} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400">{formatTime(currentTime)}</span>
              <input type="range" min="0" max={duration || 30} step="0.05" value={currentTime} onChange={handleSeek} className="flex-1 h-1 bg-white/20 rounded-lg cursor-pointer accent-violet-500" />
              <span className="text-[10px] font-mono text-gray-400">{formatTime(duration)}</span>
            </div>

            <button onClick={toggleMute} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="bg-[#0f0f15]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5 font-mono">
            <FontIcon className="w-4 h-4 text-violet-400" /> BurnCaption Style:
          </span>
          <div className="flex gap-2">
            {["classic-white", "shorts-yellow", "tiktok-pop"].map((style) => (
              <button
                key={style}
                onClick={() => setCaptionStyle(style)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all border cursor-pointer ${captionStyle === style ? "bg-violet-600/20 border-violet-500 text-white" : "bg-[#14141e] border-white/5 text-gray-400"}`}
              >
                {style.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-15 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded">AI Segment Match</span>
            <h3 className="text-2xl font-bold text-white tracking-tight pt-1">{title}</h3>
            <p className="text-xs text-gray-500 font-mono">
              Time window: <span className="text-emerald-400 font-semibold">{bestStart} - {bestEnd}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f0f15]/80 border border-white/5 relative">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-mono mb-2">
              <Monitor className="w-3.5 h-3.5 text-violet-400" /> Engagement Analyzer Report
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed font-sans">{explanation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
