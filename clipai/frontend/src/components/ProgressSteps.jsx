import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Cpu, Film, Sparkles, Download, Scissors } from "lucide-react";

export function ProgressSteps({ step, progress, status, error }) {
  const steps = useMemo(() => [
    { title: "Input Verified", desc: "Verifying YouTube source metadata", icon: Check },
    { title: "AI Analysis", desc: "LLM decoding key viral and audio hooks", icon: Sparkles },
    { title: "FFmpeg Cut", desc: "Slicing high-energy 30s stream with millisecond accuracy", icon: Scissors },
    { title: "Burn Subtitles", desc: "Whisper speech-to-text dynamic timestamp sync", icon: Film },
    { title: "Finished", desc: "Synthesized ClipAI MP4 export package ready", icon: Download },
  ], []);

  const bars = useMemo(() => Array.from({ length: 42 }).map((_, i) => ({
    height: Math.sin(i * 0.4) * 35 + 45 + (Math.random() * 15 - 7.5),
    delay: i * 0.04,
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      <div className="bg-[#0f0f15]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-400 animate-spin" style={{ animationDuration: "3s" }} />
              ClipAI Autocut Engine Active
            </h3>
            <p className="text-sm text-gray-400">
              {status === "failed" ? "Processing error" : `Pipeline running... (${progress}%)`}
            </p>
          </div>
          <span className="text-xl font-bold font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20">
            {progress}%
          </span>
        </div>

        <div className="h-2 w-full bg-[#151520] rounded-full overflow-hidden mb-8 relative">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500 rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step || status === "completed";
            const isActive = stepNum === step && status !== "completed" && status !== "failed";
            const StepIcon = s.icon;

            return (
              <div key={idx} className="flex md:flex-col items-start gap-4 md:gap-3 text-left md:text-center relative">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[calc(50%+20px)] top-[20px] right-[calc(-50%+20px)] h-[2px] bg-white/10 z-0" />
                )}

                <div className="flex justify-center w-full md:w-auto mx-auto z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                      : isActive
                      ? "bg-[#1d1d30] border-2 border-violet-500 text-violet-400 font-bold"
                      : "bg-[#111111] border border-white/5 text-gray-500"
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                </div>

                <div className="flex-1 md:text-center">
                  <h4 className={`text-sm font-medium tracking-tight ${isActive ? "text-violet-400" : isCompleted ? "text-white" : "text-gray-500"}`}>
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {status === "processing" && (
          <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
            <div className="h-16 flex items-end justify-between gap-[2px] px-1 bg-[#0b0b10] rounded-xl border border-white/[0.02] overflow-hidden">
              {bars.map((bar, index) => (
                <motion.div
                  key={index}
                  animate={{ height: [`${bar.height * 0.4}%`, `${bar.height * 1.1}%`, `${bar.height * 0.4}%`] }}
                  transition={{ repeat: Infinity, duration: 1.2 + Math.random() * 0.8, delay: bar.delay }}
                  className={`w-full min-h-[4px] rounded-t-sm ${index / bars.length * 100 < progress ? "bg-gradient-to-t from-violet-600 to-fuchsia-500 opacity-90" : "bg-white/10"}`}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
