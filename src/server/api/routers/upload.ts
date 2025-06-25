// src/server/api/routers/upload.ts
import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "~/server/api/trpc";
import { uploadImageToB2 } from "~/server/lib/uploadImage";

export const uploadRouter = createTRPCRouter({
  image: publicProcedure
    .input(z.object({
      filePath: z.string(),
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const url = await uploadImageToB2(input.filePath, input.fileName);
      return { url };
    }),
});
