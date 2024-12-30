import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export const getSongs = (req: Request, res: Response): void => {
  const musicDir = path.join(__dirname, "../music");
  fs.readdir(musicDir, (err, files) => {
    if (err) {
      res.status(500).send("Failed to read music directory");
      return;
    }
    const songs = files.map((file) => ({
      filename: file,
      title: path.parse(file).name,
    }));
    res.json(songs);
  });
};

export const streamMusic = (req: Request, res: Response): void => {
  const filePath = path.join(__dirname, "../music", req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send("File not found");
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg",
      "Cross-Origin-Resource-Policy": "cross-origin", // Add this header
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};