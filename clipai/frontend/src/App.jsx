import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  History, 
  Trash2, 
  CheckCircle, 
  Flame, 
  Clapperboard 
} from "lucide-react";
import { URLInput } from "./components/URLInput";
import { ProgressSteps } from "./components/ProgressSteps";
import { VideoPreview } from "./components/VideoPreview";
import { DownloadButton } from "./components/DownloadButton";

export default function App() {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [savedClips, setSavedClips] = useState([]);
  const [urlOfActiveJob, setUrlOfActiveJob] = useState("");
  const pollingRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clipai_history");
      if (stored) {
        setSavedClips(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const startPolling = (jobToPoll) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${jobToPoll}`);
        if (!response.ok) throw new Error("Connection failed");

        const data = await response.json();
        setStatus(data.status);
        setStep(data.step);
        setProgress(data.progress);
        setError(data.error);

        if (data.status === "completed" && data.result) {
          setResult(data.result);
          if (pollingRef.current) clearInterval(pollingRef.current);
          addToHistory(jobToPoll, data.result);
        } else if (data.status === "failed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error(err);
        setError("Network sync issue. Re-connecting...");
      }
    }, 1200);
  };

  const handleSubmitUrl = async (url) => {
    setError(null);
    setResult(null);
    setJobId(null);
    setStatus("processing");
    setStep(1);
    setProgress(5);

    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed initiating pipeline");
      }

      const data = await response.json();
      setJobId(data.job_id);
      startPolling(data.job_id);
    } catch (err) {
      setStatus("failed");
      setError(err?.message || "Internal server error occurred");
    }
  };

  const addToHistory = (id, clipResult) => {
    setSavedClips((prev) => {
      if (prev.some((c) => c.jobId === id)) return prev;

      const newClip = {
        jobId: id,
        url: urlOfActiveJob || "https://youtube.com/watch",
        title: clipResult.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: clipResult,
      };

      const updated = [newClip, ...prev].slice(0, 8);
      localStorage.setItem("clipai_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectHistory = (clip) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setJobId(clip.jobId);
    setStatus("completed");
    setStep(5);
    setProgress(100);
    setError(null);
    setResult(clip.result);
  };

  const handleClearHistory = () => {
    setSavedClips([]);
    localStorage.removeItem("clipai_history");
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-x-hidden text-gray-100 flex flex-col justify-between">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12 relative z-10 flex-grow">
        <header className="text-center space-y-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-600/10 rounded-full text-violet-400 border border-violet-500/20 text-xs font-semibold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(124,58,237,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Gemini LLM & Whisper AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-zinc-400 leading-tight"
          >
            Clip<span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">AI</span>
          </motion.h1>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Transform raw, lengthy YouTube videos into high-impact, kinetic-captioned, 30-second shorts in seconds. Autodetect hooks, transcribe voice, and export instantly.
          </p>
        </header>

        <main className="space-y-10">
          <div className="space-y-10">
            <URLInput
              onSubmit={(url) => {
                setUrlOfActiveJob(url);
                handleSubmitUrl(url);
              }}
              isLoading={status === "processing"}
            />

            <AnimatePresence mode="wait">
              {status !== "idle" && (
                <ProgressSteps
                  step={step}
                  progress={progress}
                  status={status}
                  error={error}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {status === "completed" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="space-y-8"
                >
                  <VideoPreview
                    videoUrl={result.video_url}
                    title={result.title}
                    explanation={result.explanation}
                    bestStart={result.best_start}
                    bestEnd={result.best_end}
                    captions={result.captions}
                  />

                  <DownloadButton jobId={jobId || "sample"} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {savedClips.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-4xl mx-auto pt-8 border-t border-white/5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <History className="w-4 h-4 text-violet-400" />
                  Your Exported Clips ({savedClips.length})
                </h3>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-rose-500/80 hover:text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedClips.map((clip) => (
                  <button
                    key={clip.jobId}
                    onClick={() => handleSelectHistory(clip)}
                    className={`flex flex-col text-left p-4 rounded-xl border relative overflow-hidden group/item cursor-pointer transition-all ${
                      jobId === clip.jobId
                        ? "bg-violet-600/10 border-violet-500 text-white"
                        : "bg-[#0b0b10] border-white/5 text-gray-400 hover:bg-[#11111a]"
                    }`}
                  >
                    <div className="absolute right-3 top-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider flex items-center gap-1.5">
                      <Clapperboard className="w-3 h-3 text-violet-400" />
                      SHORT • {clip.timestamp}
                    </span>
                    <h4 className="text-xs font-semibold text-white mt-2 mb-1 truncate w-full">
                      {clip.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 truncate w-full font-mono mt-0.5">
                      {clip.url}
                    </p>
                    {jobId === clip.jobId && (
                      <span className="absolute bottom-0 right-0 p-1.5 text-violet-400">
                        <CheckCircle className="w-3.5 h-3.5 fill-violet-950" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </main>
      </div>

      <footer className="w-full text-center py-6 border-t border-white/5 bg-[#030306]/90 relative z-10">
        <p className="text-xs text-gray-500">
          ClipAI Full-Stack Applet &copy; 2026. Made with Google AI Studio, React & Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
