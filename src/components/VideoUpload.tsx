import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Video, CheckCircle, FileVideo, AlertCircle, Sparkles, Upload } from "lucide-react";

interface VideoUploadProps {
  onUploadStart: (fileName: string, fileSizeStr: string) => void;
  onUploadProgress: (progress: number) => void;
  onUploadSuccess: (jobId: string) => void;
  onUploadError: (errorMsg: string) => void;
  isLoading: boolean;
}

export function VideoUpload({
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  isLoading
}: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type and size (500MB constraint)
  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setError("Unsupported format. Please select an MP4, MOV, AVI, MKV, or WebM video.");
      return;
    }

    const maxBytes = 500 * 1024 * 1024; // 500MB
    if (selectedFile.size > maxBytes) {
      setError("File exceeds 500MB limit. Please upload a smaller video file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    const fileSizeStr = formatSize(file.size);
    onUploadStart(file.name, fileSizeStr);

    // Create Form Data
    const formData = new FormData();
    formData.append("video", file);

    // Upload with real XHR progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onUploadProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.job_id) {
            onUploadSuccess(res.job_id);
          } else {
            onUploadError("Server returned an invalid response schema.");
          }
        } catch (e) {
          onUploadError("Failed to parse upload reply.");
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          onUploadError(errRes.error || "Failed to upload video to Server.");
        } catch (e) {
          onUploadError(`Upload connection aborted with status ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      onUploadError("An error occurred during video data transfer.");
    };

    xhr.send(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
      id="video-upload-wrapper"
    >
      <div className="relative group p-[1px] rounded-2xl bg-gradient-to-r from-violet-600/30 via-indigo-500/10 to-purple-600/30 hover:from-violet-500/60 hover:to-fuchsia-500/60 transition-all duration-500 shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)]">
        <div className="bg-[#0f0f15]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5 relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Input Source Video</h2>
              <p className="text-sm text-gray-400">Upload your own raw video to extract the most key engaging 30s slice</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".mp4,.mov,.avi,.mkv,.webm"
              className="hidden"
              disabled={isLoading}
              id="hidden-file-picker"
            />

            {/* Dash Box Drag/Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`w-full py-12 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 ${
                isLoading 
                  ? "opacity-50 pointer-events-none border-white/5 bg-transparent"
                  : isDragActive
                  ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-400/80 cursor-pointer"
                  : "border-white/10 hover:border-violet-500/40 hover:bg-[#12121c] cursor-pointer"
              }`}
              id="upload-drag-region"
            >
              {file ? (
                <>
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 relative">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                      Ready for extraction
                    </span>
                    <h4 className="text-sm font-semibold text-white break-all">{file.name}</h4>
                    <p className="text-xs text-gray-400 font-mono">Size: {formatSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-gray-500 hover:text-rose-400 transition-colors font-mono hover:underline cursor-pointer pt-1"
                  >
                    Select a different file
                  </button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-violet-600/10 text-violet-400 rounded-2xl border border-violet-500/20">
                    <Upload className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-white">Drop your video here</h3>
                    <p className="text-xs text-gray-400">or click this box to trigger local browser search</p>
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-mono">
                    MP4, MOV, AVI, MKV up to 500MB
                  </p>
                </>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5"
                id="upload-validation-error"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300 font-medium">{error}</p>
              </motion.div>
            )}

            {file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                id="extract-action-row"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(124,58,237,0.35)] hover:shadow-[0_0_45px_rgba(124,58,237,0.55)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-sans"
                  id="extract-best-clip-submit"
                >
                  <Sparkles className="w-4.5 h-4.5 text-yellow-300 animate-pulse" />
                  Extract Best Clip
                </button>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}
