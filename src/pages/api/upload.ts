// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { randomUUID } from "crypto";
import B2 from "backblaze-b2";
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";

export const config = {
  api: {
    bodyParser: false,
  },
};

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID!,
  applicationKey: process.env.B2_APP_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    await b2.authorize();

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ success: false, message: "Parse error" });
      }

      const file = files.file as unknown as formidable.File;

      if (!file || !file.filepath) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const fileStream = fs.createReadStream(file.filepath);
      const fileName = `${randomUUID()}-${file.originalFilename}`;

      const uploadUrlData = await b2.getUploadUrl({ bucketId: process.env.B2_BUCKET! });

      await b2.uploadFile({
        uploadUrl: uploadUrlData.data.uploadUrl,
        uploadAuthToken: uploadUrlData.data.authorizationToken,
        fileName,
        data: fileStream,
        contentType: file.mimetype || "application/octet-stream",
      });

      const publicUrl = `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET}/${fileName}`;

      await db.insert(tasks).values({
        title: "Uploaded Image",
        imageUrl: publicUrl,
      });

      return res.status(200).json({ success: true, url: publicUrl });
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
}
