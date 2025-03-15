import * as faceapi from "@vladmandic/face-api";
import { useEffect, useRef, useState } from "react";
import { checkLiveness } from "../ultils/checkFakeFace";

const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  console.log("✅ Models loaded successfully!");
};

const FaceCompare = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
    startVideo();
  }, []);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const compareFace = async () => {
    if (!videoRef.current) return;

    console.log("🔍 Đang kiểm tra liveness...");
    const isLive = await checkLiveness(videoRef.current);

    if (!isLive) {
      console.log("🚨 Phát hiện ảnh tĩnh! Dừng quá trình đăng ký.");
      return;
    }

    console.log("✅ Liveness check thành công! Tiến hành quét khuôn mặt...");

    const detections = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      alert("❌ Không tìm thấy khuôn mặt!");
      return;
    }

    const faceVector = detections.descriptor;
    const storedData = JSON.parse(localStorage.getItem("faceData") || "[]");

    if (!storedData.length) {
      alert("⚠️ Không có dữ liệu khuôn mặt nào để so sánh!");
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
      setMatchedName(bestMatch);
      alert(`✅ Nhận diện thành công: ${bestMatch}`);
    } else {
      setMatchedName(null);
      alert("❌ Không khớp với ai trong dữ liệu!");
    }
  };

  return (
    <div>
      <h1>Face Comparison</h1>
      <video ref={videoRef} autoPlay width="320" height="240" />
      <br />
      <button onClick={compareFace}>Compare Face</button>
      {matchedName && <p>✅ Matched: {matchedName}</p>}
    </div>
  );
};

export default FaceCompare;
