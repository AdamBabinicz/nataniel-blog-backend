const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Upload File
const cloudinaryUploadFile = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "video", // Zmiana na "video" dla plików wideo
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Wewnętrzny błąd serwera (cloudinary)");
  }
};

// Cloudinary Remove File
const cloudinaryRemoveFile = async (filePublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(filePublicId);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Wewnętrzny błąd serwera (cloudinary)");
  }
};

// Cloudinary Remove Multiple Files
const cloudinaryRemoveMultipleFiles = async (publicIds) => {
  try {
    const result = await cloudinary.v2.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Wewnętrzny błąd serwera (cloudinary)");
  }
};

module.exports = {
  cloudinaryUploadFile, // Zmiana nazwy funkcji na bardziej ogólną, obsługującą różne typy plików
  cloudinaryRemoveFile,
  cloudinaryRemoveMultipleFiles,
};
