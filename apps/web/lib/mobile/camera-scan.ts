// Camera scan helpers — request user camera, capture frame, return Blob.
// Built for mobile: prefers rear camera, applies basic exposure/focus hints.

export interface CameraSession {
  stream: MediaStream;
  video: HTMLVideoElement;
  stop(): void;
}

export async function startRearCamera(target: HTMLVideoElement): Promise<CameraSession> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    throw new Error("camera_unavailable");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
  target.srcObject = stream;
  target.setAttribute("playsinline", "true");
  await target.play();
  return {
    stream,
    video: target,
    stop() {
      stream.getTracks().forEach((t) => t.stop());
      target.srcObject = null;
    },
  };
}

export async function captureFrame(video: HTMLVideoElement, mime: "image/jpeg" | "image/png" = "image/jpeg", quality = 0.9): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob_failed"))), mime, quality);
  });
}

// Very lightweight document-edge heuristic — luminance variance across rows
// gives a rough confidence score (used as UI hint, not OCR substitute).
export function frameConfidence(imageData: ImageData): number {
  const { data, width, height } = imageData;
  let total = 0;
  let count = 0;
  const stride = 16;
  for (let y = 0; y < height; y += stride) {
    let rowLum = 0;
    let rowCount = 0;
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      rowLum += lum;
      rowCount++;
    }
    if (rowCount > 0) {
      total += rowLum / rowCount;
      count++;
    }
  }
  const avg = count > 0 ? total / count : 0;
  // 0..1 score — middle exposure ≈ 0.7
  return Math.max(0, Math.min(1, 1 - Math.abs(avg - 128) / 128));
}
