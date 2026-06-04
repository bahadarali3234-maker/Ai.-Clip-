import React, { useState } from "react";
import { Download, Sparkles, CheckCircle, FileVideo, HardDrive, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface DownloadButtonProps {
  jobId: string;
}

export function DownloadButton({ jobId }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloaded(false);
    
    try {
      // Direct anchor click trigger to initiate actual streaming download file from Express server
      const link = document.createElement("a");
      link.href = `/api/download/${jobId}`;
      link.setAttribute("download", `clipai_${jobId}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Simulation timeout for state completion
      setTimeout(() => {
        setDownloading(false);
        setDownloaded(true);
      }, 2000);
    } catch (err) {
      console.error(err);
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto"
      id="download-button-wrapper"
    >
      <div className="bg-[#10101b]/60 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/10 shadow-2xl relative overflow-hidden">
        {/* Dynamic decorative visual effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-500/15 text-violet-400 rounded-xl border border-violet-500/20 shrink-0">
              <FileVideo className="w-6 h-6" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Your 30s Viral Short is Exported!
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Processed with OpenAI Whisper, FFmpeg & burn-in filters. High quality MP4.
              </p>
              
              {/* Est details bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-[11px] text-gray-500 font-mono">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-violet-400" />
                  Est. Size: ~3.8 MB
                </span>
                <span className="flex items-center gap-1">
                  <FileVideo className="w-3 h-3 text-violet-400" />
                  Format: Dynamic MP4 (1080p, 60fps)
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-violet-400" />
                  Captions Burned: True
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full md:w-auto h-12 px-8 font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(124,58,237,0.2)] hover:shadow-[0_0_35px_rgba(124,58,237,0.4)] transition-all cursor-pointer select-none border border-violet-500/20 ${
              downloaded
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
            }`}
            id="trigger-download-action"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Assembling File...
              </>
            ) : downloaded ? (
              <>
                <CheckCircle className="w-4.5 h-4.5 animate-bounce" />
                Clip Saved! Extract Again
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" />
                Download Final Clip
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
