const express = require("express");
const multer = require("multer");
const { getBucket } = require("../db");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB se barri file nahi
});

// POST /api/files/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: uploadStream.id,
          name: req.file.originalname,
          size: req.file.size,
        },
      });
    });

    uploadStream.on("error", (err) => {
      res.status(500).json({ message: "Upload failed", error: err.message });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;