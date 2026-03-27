import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as faceapi from "@vladmandic/face-api";

let isModelLoaded = false;

const loadModels = async () => {
  if (isModelLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]);
  isModelLoaded = true;
};

const DETECTION_INTERVAL_MS = 200;
const CORNER_SIZE = 24;
const Y_OFFSET = -50;
const YAW_THRESHOLD = 9;
const AUTO_VERIFY_DELAY_MS = 1000;

interface CanvasStyle {
  strokeColor: string;
  lineWidth: number;
  glowColor: string;
  glowBlur: number;
}

const DEFAULT_STYLE: CanvasStyle = {
  strokeColor: "rgba(99, 102, 241, 0.9)",
  lineWidth: 3,
  glowColor: "rgba(99, 102, 241, 0.4)",
  glowBlur: 12,
};

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: CanvasStyle
) {
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.lineWidth;
  ctx.shadowColor = style.glowColor;
  ctx.shadowBlur = style.glowBlur;
  ctx.lineCap = "round";

  const oy = Y_OFFSET;
  ctx.beginPath();
  // Top-left
  ctx.moveTo(x, y + CORNER_SIZE + oy);
  ctx.lineTo(x, y + oy);
  ctx.lineTo(x + CORNER_SIZE, y + oy);
  // Top-right
  ctx.moveTo(x + width - CORNER_SIZE, y + oy);
  ctx.lineTo(x + width, y + oy);
  ctx.lineTo(x + width, y + CORNER_SIZE + oy);
  // Bottom-right
  ctx.moveTo(x + width, y + height - CORNER_SIZE + oy);
  ctx.lineTo(x + width, y + height + oy);
  ctx.lineTo(x + width - CORNER_SIZE, y + height + oy);
  // Bottom-left
  ctx.moveTo(x + CORNER_SIZE, y + height + oy);
  ctx.lineTo(x, y + height + oy);
  ctx.lineTo(x, y + height - CORNER_SIZE + oy);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function getYawDirection(landmarks: faceapi.FaceLandmarks68) {
  const nose = landmarks.getNose()[3];
  const leftEye = landmarks.getLeftEye()[0];
  const rightEye = landmarks.getRightEye()[3];
  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const diff = nose.x - eyeCenterX;
  if (diff > YAW_THRESHOLD) return "left" as const;
  if (diff < -YAW_THRESHOLD) return "right" as const;
  return "center" as const;
}

interface UseFaceCanvasOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  isRegister: boolean;
  onAutoVerify: () => void;
  style?: Partial<CanvasStyle>;
}

export function useFaceCanvas({
  videoRef,
  isActive,
  isRegister,
  onAutoVerify,
  style,
}: UseFaceCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const isRegisterRef = useRef(isRegister);
  const onAutoVerifyRef = useRef(onAutoVerify);

  useEffect(() => {
    isRegisterRef.current = isRegister;
  }, [isRegister]);

  useEffect(() => {
    onAutoVerifyRef.current = onAutoVerify;
  }, [onAutoVerify]);

  const mergedStyle = useMemo<CanvasStyle>(
    () => ({ ...DEFAULT_STYLE, ...style }),
    [style]
  );

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopCamera();
      return;
    }

    let cancelled = false;
    const detectionsCache = { current: [] as faceapi.FaceDetection[] };

    const start = async () => {
      const [stream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { width: 400, height: 400, facingMode: "user" },
        }),
        loadModels(),
      ]);

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) resolve();
        else video.addEventListener("loadeddata", () => resolve(), { once: true });
      });
      if (cancelled) return;

      setCameraReady(true);

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      let lastDetectionTime = 0;
      let yawTriggered = false;

      const loop = async () => {
        if (cancelled) return;

        const now = Date.now();
        if (now - lastDetectionTime >= DETECTION_INTERVAL_MS) {
          lastDetectionTime = now;
          try {
            const results = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks();

            if (cancelled) return;
            detectionsCache.current = results.map((d) => d.detection);

            if (!yawTriggered && !isRegisterRef.current && results.length === 1) {
              const dir = getYawDirection(results[0].landmarks);
              if (dir !== "center") {
                yawTriggered = true;
                setTimeout(() => {
                  if (!cancelled && !isRegisterRef.current) {
                    onAutoVerifyRef.current();
                  }
                }, AUTO_VERIFY_DELAY_MS);
              }
            }
          } catch {
            // skip frame on error
          }
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const resized = faceapi.resizeResults(detectionsCache.current, displaySize);
          for (const det of resized) {
            const { x, y, width, height } = det.box;
            drawCornerBrackets(ctx, x, y, width, height, mergedStyle);
          }
        }

        animationFrameRef.current = requestAnimationFrame(loop);
      };

      loop();
    };

    start().catch((err) => console.error("Lỗi khởi tạo camera:", err));

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isActive, mergedStyle, stopCamera]);

  return { canvasRef, cameraReady } as const;
}
