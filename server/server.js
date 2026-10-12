require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
const filesRouter = require("./routes/files");
app.use("/api/files", filesRouter);

app.get("/", (req, res) => {
  res.send("File Uploader API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));