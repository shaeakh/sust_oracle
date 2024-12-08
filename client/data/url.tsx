export const BACKENDURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export const APIURL = {
    textToImage: `${BACKENDURL}/text2image`,
};