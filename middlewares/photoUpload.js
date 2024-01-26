const path = require("path");
const multer = require("multer");

// Storage for Photos and Videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ustal, czy plik to zdjęcie czy wideo i zapisz w odpowiednim folderze
    const uploadPath = file.mimetype.startsWith("image")
      ? path.join(__dirname, "../images")
      : path.join(__dirname, "../videos");

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// Upload Middleware for Photos and Videos
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Akceptuj pliki obrazów i wideo
    if (
      file.mimetype.startsWith("image") ||
      file.mimetype.startsWith("video")
    ) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 }, // 1 megabyte
});

module.exports = upload;
