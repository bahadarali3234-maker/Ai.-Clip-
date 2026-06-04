import React, { useState } from "react";
import { motion } from "motion/react";
import { Youtube, ArrowRight } from "lucide-react";

export function URLInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please paste a YouTube URL to begin extraction.");
      return;
    }

    const youtubeRegExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegExp.test(url.trim())) {
      setError("Please enter a valid YouTube video or shorts link.");
      return;
    }

    onSubmit(url.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="relative group p-[1px] rounded-2xl bg-gradient-to-r from-violet-600/30 via-indigo-500/10 to-purple-600/30 hover:from-violet-500/60 hover:to-fuchsia-500/60 transition-all duration-500 shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)]">
        <div className="bg-[#0f0f15]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Youtube className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Input Source Video</h2>
              <p className="text-sm text-gray-400">Paste any YouTube link to extract the most engaging 30-second window</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={isLoading}
                  className="w-full h-14 pl-12 pr-4 bg-[#0a0a0f]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm disabled:opacity-50"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Youtube className="w-5 h-5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-14 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? "Analyzing..." : (
                  <>
                    Autocut Video
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium pl-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}
