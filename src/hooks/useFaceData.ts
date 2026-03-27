import { useState, useCallback, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import { useDispatch } from "react-redux";
import { setIsLoading } from "../store/statusSlice";
import { toastError, toastSuccess, toastWarning } from "../ultils/toast";

const STORAGE_KEY = "faceData";
const MATCH_THRESHOLD = 0.5;

interface FaceRecord {
  name: string;
  faceVector: number[];
}

function getStoredFaces(): FaceRecord[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function setStoredFaces(data: FaceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useFaceData(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const dispatch = useDispatch();
  const [faceCount, setFaceCount] = useState(() => getStoredFaces().length);
  const [matchResult, setMatchResult] = useState<string | null>(null);
  const processingRef = useRef(false);

  const detectFaceDescriptor = useCallback(async () => {
    if (!videoRef.current) return null;
    return faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();
  }, [videoRef]);

  const findBestMatch = useCallback(
    (descriptor: Float32Array, stored: FaceRecord[]): string | null => {
      let bestMatch: string | null = null;
      let minDistance = Infinity;
      for (const item of stored) {
        const distance = faceapi.euclideanDistance(descriptor, item.faceVector);
        if (distance < minDistance && distance < MATCH_THRESHOLD) {
          minDistance = distance;
          bestMatch = item.name;
        }
      }
      return bestMatch;
    },
    []
  );

  const isFaceAlreadyExists = useCallback(
    (descriptor: number[], stored: FaceRecord[]): boolean => {
      return stored.some(
        (item) =>
          faceapi.euclideanDistance(descriptor, item.faceVector) < MATCH_THRESHOLD
      );
    },
    []
  );

  const captureFace = useCallback(
    async (name: string) => {
      if (processingRef.current) return false;
      if (!name.trim()) {
        toastError("Vui lòng nhập tên!")();
        return false;
      }
      processingRef.current = true;
      dispatch(setIsLoading(true));
      try {
        const detection = await detectFaceDescriptor();
        if (!detection) {
          toastWarning("Vui lòng đưa khuôn mặt vào giữa khung hình!")();
          return false;
        }
        const vector = Array.from(detection.descriptor);
        const storedData = getStoredFaces();
        if (isFaceAlreadyExists(vector, storedData)) {
          toastWarning("Khuôn mặt này đã tồn tại trong hệ thống!")();
          return false;
        }
        const newData = [...storedData, { name: name.trim(), faceVector: vector }];
        setStoredFaces(newData);
        setFaceCount(newData.length);
        toastSuccess("Đã đăng ký khuôn mặt thành công!")();
        return true;
      } catch (error) {
        console.error("Lỗi khi lưu dữ liệu:", error);
        return false;
      } finally {
        dispatch(setIsLoading(false));
        processingRef.current = false;
      }
    },
    [dispatch, detectFaceDescriptor, isFaceAlreadyExists]
  );

  const compareFace = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    dispatch(setIsLoading(true));
    try {
      const detection = await detectFaceDescriptor();
      if (!detection) {
        toastError("Không tìm thấy khuôn mặt!")();
        setMatchResult(null);
        return;
      }
      const storedData = getStoredFaces();
      if (!storedData.length) {
        toastWarning("Không có dữ liệu khuôn mặt nào để so sánh!")();
        setMatchResult(null);
        return;
      }
      const bestMatch = findBestMatch(detection.descriptor, storedData);
      if (bestMatch) {
        setMatchResult(bestMatch);
        toastSuccess(`Nhận diện thành công: ${bestMatch}`)();
      } else {
        setMatchResult(null);
        toastError("Không khớp với ai trong dữ liệu!")();
      }
    } catch (error) {
      console.error("Lỗi khi so sánh khuôn mặt:", error);
    } finally {
      dispatch(setIsLoading(false));
      processingRef.current = false;
    }
  }, [dispatch, detectFaceDescriptor, findBestMatch]);

  const deleteAllFaces = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFaceCount(0);
    setMatchResult(null);
    toastSuccess("Dữ liệu đã được xóa!")();
  }, []);

  const clearMatchResult = useCallback(() => setMatchResult(null), []);

  return {
    faceCount,
    matchResult,
    captureFace,
    compareFace,
    deleteAllFaces,
    clearMatchResult,
  } as const;
}
