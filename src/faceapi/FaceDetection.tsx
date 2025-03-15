import React, { useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";

const loadModels = async () => {
  try {
    console.log("⏳ Đang tải models...");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models").catch((error) => {
      console.error("❌ Lỗi khi tải tinyFaceDetector:", error);
    });
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models").catch((error) => {
      console.error("❌ Lỗi khi tải ssdMobilenetv1:", error);
    });
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models").catch((error) => {
      console.error("❌ Lỗi khi tải faceLandmark68Net:", error);
    });
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models").catch((error) => {
      console.error("❌ Lỗi khi tải faceRecognitionNet:", error);
    });
    console.log("✅ Models loaded successfully!");
  } catch (error) {
    console.error("❌ Lỗi khi tải models:", error);
  }
};
const FaceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("❌ Lỗi khi mở camera:", error);
      }
    };

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;

      video.addEventListener("loadeddata", async () => {
        console.log("📸 Camera đã sẵn sàng!");

        const displaySize = { width: video.videoWidth, height: video.videoHeight+50 };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
// console.log(resizedDetections);

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // faceapi.draw.drawDetections(canvas, resizedDetections);
            resizedDetections.forEach((detection) => {
              const { x, y, width, height } = detection.box;
          const cornerSize = 30;
              // 🌟 Vẽ khung nhưng KHÔNG hiển thị số
              ctx.strokeStyle = "rgba(52, 173, 218, 0.8)";
              ctx.lineWidth = 3;
              ctx.shadowColor = "rgba(209, 220, 209, 0.5)";
              ctx.shadowBlur = 10;
          
              ctx.beginPath();
              // ctx.roundRect(x, y-100, width, height+50, [15]);
   // Góc trên trái
ctx.moveTo(x, y + cornerSize - 50);
ctx.lineTo(x, y - 50);
ctx.lineTo(x + cornerSize, y - 50);

// Góc trên phải
ctx.moveTo(x + width - cornerSize, y - 50);
ctx.lineTo(x + width, y - 50);
ctx.lineTo(x + width, y + cornerSize - 50);

// Góc dưới phải
ctx.moveTo(x + width, y + height - cornerSize - 50);
ctx.lineTo(x + width, y + height - 50);
ctx.lineTo(x + width - cornerSize, y + height - 50);

// Góc dưới trái
ctx.moveTo(x + cornerSize, y + height - 50);
ctx.lineTo(x, y + height - 50);
ctx.lineTo(x, y + height - cornerSize - 50);

              ctx.stroke();
              ctx.closePath();
            });
            
          }
        }, 100);
      });
    };

    loadModels().then(() => {
      startVideo().then(detectFaces);
    });
  }, []);

  return (
    <div className="relative">
      <video ref={videoRef} autoPlay muted className="absolute top-0 left-0 w-full h-auto" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-auto" />
    </div>
  );
};

export default FaceDetection;
