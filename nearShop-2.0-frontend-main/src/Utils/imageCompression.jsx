
import imageCompression from "browser-image-compression";

export const compressImage = async (file) => {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please select a valid image");
  }

  const options = {
    maxSizeMB: 0.3,          // Target maximum size: 300 KB
    maxWidthOrHeight: 1200,  // Resize large images
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);

    console.log("Original size:", (file.size / 1024).toFixed(2), "KB");
    console.log("Compressed size:", (compressedFile.size / 1024).toFixed(2), "KB");

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
};
