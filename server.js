const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.get("/", (req,res)=>res.send("Video converter running"));

app.post("/convert", upload.single("video"), (req, res) => {

  const input = req.file.path;
  const output = input + ".mp4";

  ffmpeg(input)
    .videoCodec("libx264")
    .audioCodec("aac")
    .outputOptions([
      "-preset ultrafast",
      "-pix_fmt yuv420p",
      "-movflags +faststart"
    ])
    .save(output)
    .on("end", () => {
      res.download(output, "reel_whatsapp.mp4", () => {
        fs.unlinkSync(input);
        fs.unlinkSync(output);
      });
    })
    .on("error", err => {
      console.error(err);
      res.status(500).send("Conversion failed");
    });

});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log("Server running on",PORT));
