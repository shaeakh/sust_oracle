import axios from "axios";

export const uploadAssetsToCloud = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_Assets_UPLOAD_PRESET!
  );
  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed");
  }
};
