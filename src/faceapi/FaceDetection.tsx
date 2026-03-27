import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaCamera, FaUserCheck } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { ToastContainer } from "react-toastify";
import { useFaceCanvas } from "../hooks/useFaceCanvas";
import { useFaceData } from "../hooks/useFaceData";

const FaceDetection: React.FC<{ isRegister: boolean }> = ({ isRegister }) => {
  const isOpen = useSelector((state: RootState) => state.statusApp.isOpenVideo);
  const [name, setName] = useState("");
  const [showInstruction, setShowInstruction] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    faceCount,
    matchResult,
    captureFace,
    compareFace,
    deleteAllFaces,
    clearMatchResult,
  } = useFaceData(videoRef);

  const onAutoVerify = useCallback(() => {
    setShowInstruction(false);
    compareFace();
  }, [compareFace]);

  const { canvasRef, cameraReady } = useFaceCanvas({
    videoRef,
    isActive: isOpen,
    isRegister,
    onAutoVerify,
  });

  useEffect(() => {
    setShowInstruction(true);
    clearMatchResult();
  }, [isRegister, clearMatchResult]);

  const handleRegister = useCallback(async () => {
    const success = await captureFace(name);
    if (success) setName("");
  }, [captureFace, name]);

  return (
    <div className="relative flex flex-col w-[calc(100vw-2rem)] max-w-[460px] bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`px-4 sm:px-5 py-3.5 ${isRegister ? "bg-gradient-to-r from-indigo-500 to-violet-600" : "bg-gradient-to-r from-emerald-500 to-teal-600"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${cameraReady ? "bg-white" : "bg-white/40"}`} />
            <span className="text-white text-sm font-semibold">
              {isRegister ? "Đăng ký khuôn mặt" : "Xác thực khuôn mặt"}
            </span>
          </div>
          <span className="text-[11px] text-white/70 font-mono">
            {faceCount} saved
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-slate-50/50 px-4 sm:px-5 py-4 flex flex-col items-center">
        {/* Banners */}
        {showInstruction && !isRegister && (
          <div className="w-full mb-3 text-center text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
            Xoay đầu sang trái hoặc phải để xác thực tự động
          </div>
        )}
        {matchResult && !isRegister && (
          <div className="w-full mb-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <FaUserCheck className="text-emerald-500 shrink-0" />
            <span>Xác thực thành công: <strong>{matchResult}</strong></span>
          </div>
        )}

        {/* Camera */}
        <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full overflow-hidden border-4 border-white shadow-lg">
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-slate-400 text-xs">Khởi động camera...</span>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute left-1/2 top-[-50%] -translate-x-1/2 translate-y-1/2 w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute left-1/2 top-[-50%] -translate-x-1/2 translate-y-1/2 w-full h-full scale-x-[-1] z-10"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-5 py-4 flex flex-col gap-2.5 border-t border-slate-100">
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Nhập tên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all text-sm"
            />
            <button
              onClick={handleRegister}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <FaCamera className="text-xs" />
              Đăng ký
            </button>
          </>
        )}

        {!isRegister && (
          <button
            onClick={compareFace}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <FaUserCheck className="text-xs" />
            Xác thực thủ công
          </button>
        )}

        <button
          onClick={deleteAllFaces}
          className="w-full py-1.5 text-slate-400 hover:text-red-500 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:bg-red-50"
        >
          <FaDeleteLeft />
          Xóa dữ liệu ({faceCount})
        </button>
      </div>

      <ToastContainer className="z-[99999999]" />
    </div>
  );
};

export default FaceDetection;
