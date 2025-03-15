import  { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

const FaceRecognition = () => {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [encoding, setEncoding] = useState<number[] | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const loadModels = async () => {
            console.log("⏳ Loading models...");
            await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            setModelsLoaded(true);
            console.log("✅ Models loaded successfully!");
        };
        loadModels();
    }, []);

    const handleDetectFace = async () => {
        if (!imgRef.current) return;

        console.log("📸 Detecting face...");
        const detections = await faceapi.detectSingleFace(imgRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            console.log("✅ Face detected!");
            console.log("📊 Face Descriptor:", detections.descriptor);
            setEncoding(Array.from(detections.descriptor));
        } else {
            console.log("❌ No face detected.");
            setEncoding(null);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-2">🧑‍💻 Face Recognition</h1>
            {!modelsLoaded ? (
                <p>⏳ Loading models...</p>
            ) : (
                <>
                    <p>✅ Models Loaded!</p>
                    <img ref={imgRef} src="/test-face.jpg" alt="Test Face" width={300} className="my-2 border rounded" />
                    <button onClick={handleDetectFace} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Detect Face
                    </button>
                    {encoding && (
                        <pre className="mt-4 p-2 bg-gray-100 rounded">
                            {JSON.stringify(encoding, null, 2)}
                        </pre>
                    )}
                </>
            )}
        </div>
    );
};

export default FaceRecognition;
