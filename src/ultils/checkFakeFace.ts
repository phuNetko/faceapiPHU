import * as faceapi from "@vladmandic/face-api";

export const checkLiveness = async (videoElement: HTMLVideoElement) => {
  // Lấy lần quét đầu tiên
  const firstDetection = await faceapi
    .detectSingleFace(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!firstDetection) {
    alert("❌ Không phát hiện khuôn mặt!");
    return false;
  }

  console.log("🕒 Đợi 2 giây để kiểm tra liveness...");
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Đợi 2 giây

  // Lấy lần quét thứ hai sau 2 giây
  const secondDetection = await faceapi
    .detectSingleFace(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!secondDetection) {
    alert("❌ Không phát hiện khuôn mặt lần hai!");
    return false;
  }

  // Tính khoảng cách giữa hai lần quét
  const distance = faceapi.euclideanDistance(
    firstDetection.descriptor,
    secondDetection.descriptor
  );

  console.log(`📏 Khoảng cách giữa hai lần quét: ${distance}`);

  if (distance < 0.2) {
    alert("❌ Phát hiện ảnh tĩnh! Vui lòng sử dụng khuôn mặt thật.");
    return false;
  }

  console.log("✅ Liveness check passed!");
  return true;
};
