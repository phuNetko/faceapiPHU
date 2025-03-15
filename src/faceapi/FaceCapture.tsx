import * as faceapi from "@vladmandic/face-api";
import { useEffect, useRef, useState } from "react";
import { checkLiveness } from "../ultils/checkFakeFace";

const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  console.log("✅ Models loaded successfully!");
};

const FaceCapture = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [faceVector, setFaceVector] = useState<number[] | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    loadModels();
    startVideo();
  }, []);

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
 

    const detections = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const vector = Array.from(detections.descriptor);
      setFaceVector(vector);
      const storedData = JSON.parse(localStorage.getItem("faceData") || "[]");
      const newData = [...storedData, { name, faceVector: vector }];
      localStorage.setItem("faceData", JSON.stringify(newData));

      alert(`Face data saved for ${name}`);
    } else {
      alert("❌ Không tìm thấy khuôn mặt!");
    }
  };

  return (
    <div>
      <h1>Face Capture</h1>
      <video ref={videoRef} autoPlay width="320" height="240" />
      <br />
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={captureFace}>Capture & Save</button>
      {faceVector && <p>✅ Face Vector Captured!</p>}
    </div>
  );
};

export default FaceCapture;
