const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { getBucket } = require("../db");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
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
router.get("/", async (req, res) => {
  try {
    const bucket = getBucket();
    const files = await bucket.find({}).toArray();
    res.json(files.map((f) => ({
      id: f._id,
      name: f.filename,
      size: f.length,
      uploadDate: f.uploadDate,
    })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid file id" });
    }
    const id = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getBucket();
    const files = await bucket.find({ _id: id }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    res.set("Content-Type", files[0].contentType || "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename="${files[0].filename}"`);
    const downloadStream = bucket.openDownloadStream(id);
    downloadStream.pipe(res);
    downloadStream.on("error", () => {
      res.status(500).json({ message: "Download failed" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid file id" });
    }
    const id = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getBucket();
    const files = await bucket.find({ _id: id }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    await bucket.delete(id);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
module.exports = router;