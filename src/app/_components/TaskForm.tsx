"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function TaskForm() {
  const utils = api.useUtils();

  const createTask = api.tasks.createTask.useMutation({
    onSuccess: async () => {
      await utils.tasks.getTasks.invalidate(); // Refresh task list
      setTitle("");
      setDescription("");
      setImageUrl("");
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    createTask.mutate({ title, description, imageUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 p-4 rounded space-y-4 w-full max-w-xl">
      <input
        className="w-full p-2 border-2 rounded text-white"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 rounded border-2 text-white"
        placeholder="Task description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Create Task
      </button>
    </form>
  );
}
