import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Function to upload audio file to Cloudinary
export const uploadAudioToCloudinary = async (file: File): Promise<string> => {
  try {
    // Convert file to base64
    const base64File = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.readAsDataURL(file);
    });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: "video", // Cloudinary uses 'video' for audio files
      folder: "flowgeist-audio",
      format: "mp3", // Convert to MP3 for better compatibility
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Function to get audio URL from Cloudinary
export const getAudioUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "mp3",
  });
};
