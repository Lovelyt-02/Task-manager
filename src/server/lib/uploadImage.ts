// src/server/lib/uploadImage.ts

import { b2 } from "./b2";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const uploadImageToB2 = async (filePath: string, fileName?: string) => {
  await b2.authorize();

  const uploadUrlResponse = await b2.getUploadUrl({
    bucketId: process.env.B2_BUCKET_ID!,
  });

  const fileBuffer = fs.readFileSync(filePath);
  const finalName = fileName || `${uuidv4()}.jpg`;

  const result = await b2.uploadFile({
    uploadUrl: uploadUrlResponse.data.uploadUrl,
    uploadAuthToken: uploadUrlResponse.data.authorizationToken,
    fileName: finalName,
    data: fileBuffer,
  });

  return `https://f000.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${finalName}`;
};
