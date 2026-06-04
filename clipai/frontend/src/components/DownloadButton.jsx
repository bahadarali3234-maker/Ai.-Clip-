import React, { useState } from "react";
import { Download, CheckCircle, FileVideo, HardDrive } from "lucide-react";
import { motion } from "motion/react";

export function DownloadButton({ jobId }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setDownloaded(false);
    
    try {
      const link = document.createElement("a");
      link.href = `/api/download/${jobId}`;
      link.setAttribute("download", `clipai_${jobId}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
    >
      <div className="bg-[#10101b]/60 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-500/15 text-violet-400 rounded-xl border border-violet-500/20 shrink-0">
              <FileVideo className="w-6 h-6" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-base font-semibold text-white tracking-tight">Your 30s Viral Short is Exported!</h3>
              <p className="text-xs text-gray-400 font-sans">Processed with OpenAI Whisper, FFmpeg & burn-in filters.</p>
              
              <div className="flex gap-x-4 pt-1 text-[11px] text-gray-500 font-mono">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Est. Size: ~3.8 MB
                </span>
                <span className="flex items-center gap-1">
                  <FileVideo className="w-3 h-3" /> 1080p, 60fps MP4
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full md:w-auto h-12 px-8 font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              downloaded
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
            }`}
          >
            {downloading ? "Assembling..." : downloaded ? (
              <>
                <CheckCircle className="w-4.5 h-4.5" /> Clip Saved!
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" /> Download Final Clip
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
