import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { FaCamera } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { setIsLoading } from "../store/statusSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { toastError, toastSuccess, toastWarning } from "../ultils/toast";
import { ToastContainer } from "react-toastify";
let isModelLoaded = false;

const loadModels = async () => {
  if (isModelLoaded) return;
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
  } finally {
    isModelLoaded = true;
  }
};
const FaceDetection: React.FC<{ isRegister: boolean }> = ({ isRegister }) => {
  const isOpen = useSelector((state: RootState) => state.statusApp.isOpenVideo);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);


  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("❌ Lỗi khi mở camera:", error);
      }
    };

    const stopVideo = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      let lastDetectionTime = 0;
      video.addEventListener("loadeddata", async () => {
        console.log("📸 Camera đã sẵn sàng!");
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const detectAndDraw = async () => {
          if (!video || !canvas) return;
          const now = Date.now();
          if (now - lastDetectionTime >= 200) {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              resizedDetections.forEach((detection) => {
                const { x, y, width, height } = detection.box;
                const cornerSize = 30;
                ctx.strokeStyle = "rgba(52, 173, 218, 0.9)";
                ctx.lineWidth = 10;
                ctx.shadowColor = "rgba(0, 0, 0, 1)";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(x, y + cornerSize - 50);
                ctx.lineTo(x, y - 50);
                ctx.lineTo(x + cornerSize, y - 50);
                ctx.moveTo(x + width - cornerSize, y - 50);
                ctx.lineTo(x + width, y - 50);
                ctx.lineTo(x + width, y + cornerSize - 50);
                ctx.moveTo(x + width, y + height - cornerSize - 50);
                ctx.lineTo(x + width, y + height - 50);
                ctx.lineTo(x + width - cornerSize, y + height - 50);
                ctx.moveTo(x + cornerSize, y + height - 50);
                ctx.lineTo(x, y + height - 50);
                ctx.lineTo(x, y + height - cornerSize - 50);
                ctx.stroke();
                ctx.closePath();
              });
            }

          }
          animationFrameRef.current = requestAnimationFrame(detectAndDraw);
        };
        // Sử dụng requestAnimationFrame thay vì setInterval
        detectAndDraw();
      });
    };

    if (isOpen) {
      try {
        dispatch(setIsLoading(true));
        loadModels().then(() => {
          startVideo().then(detectFaces);
        });
      } catch (error) {
        console.error("❌ Lỗi khi tải models:", error);
      } finally {
        dispatch(setIsLoading(false));
      }
    } else {
      stopVideo();
    }

    return () => {
      stopVideo();
    };
  }, [isOpen]);



  const captureFace = async () => {
    if (!videoRef.current) return;
    if (name == "") {
      toastError("❌ Vui lòng nhập tên!")();
      return;
    }
    try {
      dispatch(setIsLoading(true));
      await new Promise((resolve) => setTimeout(resolve, 50));
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detections) {
        const vector = Array.from(detections.descriptor);
        const storedData = JSON.parse(localStorage.getItem("faceData") || "[]");
        const alreadyExists = isFaceAlreadyExists(vector, storedData);
        if (alreadyExists) {
          toastWarning("⚠️ Khuôn mặt này đã tồn tại trong hệ thống!")();
          return;
        }
        const newData = [...storedData, { name, faceVector: vector }];
        localStorage.setItem("faceData", JSON.stringify(newData));
        toastSuccess("Đã thêm khuôn mặt thành công!!!")();
        setName('')
      } else {
        toastWarning("Vui lòng đưa khuôn mặt vào giữa khung hình!")();
      }
    } catch (error) {
      console.error("❌ Lỗi khi lưu dữ liệu:", error);
      dispatch(setIsLoading(false));
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const isFaceAlreadyExists = (
    newDescriptor: number[],  // <-- hoặc Float32Array đều OK
    existingData: { name: string; faceVector: number[] }[],
    threshold: number = 0.5
  ): boolean => {
    return existingData.some((item) => {
      const distance = faceapi.euclideanDistance(newDescriptor, item.faceVector);
      return distance < threshold;
    });
  };



  const compareFace = async () => {
    if (!videoRef.current) return;
    try {
      dispatch(setIsLoading(true));
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toastError("❌ Không tìm thấy khuôn mặt!")();
        return;
      }
      const faceVector = detections.descriptor;
      const storedData = JSON.parse(localStorage.getItem("faceData") || "[]");
      if (!storedData.length) {
        toastWarning("⚠️ Không có dữ liệu khuôn mặt nào để so sánh!")();
        return;
      }
      let bestMatch = null;
      let minDistance = Infinity;
      storedData.forEach((item: { name: string; faceVector: number[] }) => {
        const distance = faceapi.euclideanDistance(faceVector, item.faceVector);
        console.log(`🔍 Khoảng cách với ${item.name}:`, distance);

        if (distance < minDistance && distance < 0.5) { // 0.5 là ngưỡng nhận diện
          minDistance = distance;
          bestMatch = item.name;
        }
      });

      if (bestMatch) {
        toastSuccess(`✅ Nhận diện thành công: ${bestMatch}`)();
      } else {
        toastError("❌ Không khớp với ai trong dữ liệu!")();
      }
    } catch (error) {
      console.error("❌ Lỗi khi so sánh khuôn mặt:", error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const getYawDirection = (landmarks: faceapi.FaceLandmarks68) => {
    const nose = landmarks.getNose()[3];
    const leftEye = landmarks.getLeftEye()[0];
    const rightEye = landmarks.getRightEye()[3];
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const diff = nose.x - eyeCenterX;

    if (diff > 9) return "left";
    else if (diff < -9) return "right";
    else return "center";
  };


  useEffect(() => {
    let triggered = false;
    const interval = setInterval(async () => {
      if (triggered || !videoRef.current) return;
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks();
      if (!detection) return;
      const direction = getYawDirection(detection.landmarks);
      if (direction === "left" || direction === "right") {
        console.log(direction);
        triggered = true;
        setShowInstruction(false);
        setTimeout(async () => {
          await compareFace(); // Gọi xác thực khuôn mặt
        }, 1000);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const deleteData = () => {
    dispatch(setIsLoading(true));
    localStorage.removeItem("faceData");
    if (localStorage.getItem("faceData") == null) {
      toastSuccess("Dữ liệu đã được xóa!")();
    }
    dispatch(setIsLoading(false));
  };

  return (
    <div className="relative top-0 right-0 left-0 bottom-0 z-50 w-[600px] h-[620px] flex justify-center flex-col gap-3 items-center bg-white rounded-md ">
        {showInstruction&&!isRegister && (
          <div className="text-center text-base text-gray-600 bg-yellow-100 border border-yellow-300 rounded-md px-4 py-2 mt-2 animate-pulse">
            👉 Hãy xoay đầu sang trái hoặc phải để bắt đầu xác thực khuôn mặt!
          </div>
        )}
      <div className="relative w-[350px] h-[350px] rounded-full flex-shrink-0 overflow-hidden">
        <video ref={videoRef} autoPlay muted className="absolute left-1/2 top-[-50%] -translate-x-1/2 translate-y-1/2 w-full h-full  scale-x-[-1]" />
        <canvas ref={canvasRef} className="absolute left-1/2 top-[-50%] -translate-x-1/2 translate-y-1/2 w-full h-full  scale-x-[-1] z-100" />
      </div>
      <div className="flex justify-center flex-col items-center gap-3">
        {isRegister &&
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-full px-3 py-2 pl-0.5 outline-none border-b-2 border-black"
            />
            <button
              onClick={captureFace}
              className=" w-auto px-5 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#34addacc] font-medium bg-white rounded-full flex justify-center gap-2 items-center border-solid transition-all duration-100 hover:shadow-md">
              <span>{"Register"}</span>
              <FaCamera />
            </button>
          </>}
        <button
          onClick={deleteData}
          className=" w-auto px-5 py-2 cursor-pointer hover:bg-gray-100 hover:text-red-500 font-medium bg-white rounded-full flex justify-center gap-2 items-center border-solid transition-all duration-100 hover:shadow-md">
          <span>Delete Data</span>
          <FaDeleteLeft />
        </button>
      </div>
      <ToastContainer className='z-[99999999]' />
    </div>
  );
};

export default FaceDetection;
