import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { tasks } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const tasksRouter = createTRPCRouter({
  createTask: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.insert(tasks).values({
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
      });
    }),

  getTasks: publicProcedure
    .input(z.object({
      status: z.enum(["pending", "in-progress", "completed"]).optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { status, page = 1, limit = 10 } = input || {};
      const offset = (page - 1) * limit;

      const query = db.select().from(tasks).limit(limit).offset(offset);
      if (status) {
        query.where(eq(tasks.status, status));
      }

      return query;
    }),

  updateTask: publicProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["pending", "in-progress", "completed"]),
    }))
    .mutation(async ({ input }) => {
      return db.update(tasks).set({ status: input.status }).where(eq(tasks.id, input.id));
    }),

  deleteTask: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.delete(tasks).where(eq(tasks.id, input.id));
    }),
});
