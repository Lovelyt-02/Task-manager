"use client";

import { api } from "~/trpc/react";

// Function to determine the next status
const getNextStatus = (
  current: "pending" | "in-progress" | "completed"
): "pending" | "in-progress" | "completed" => {
  switch (current) {
    case "pending":
      return "in-progress";
    case "in-progress":
      return "completed";
    case "completed":
      return "pending";
    default:
      return "pending";
  }
};

export function LatestTasks() {
  const utils = api.useUtils();

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = api.tasks.getTasks.useQuery({ page: 1, limit: 10 });

  const updateMutation = api.tasks.updateTask.useMutation({
    onSuccess: () => utils.tasks.getTasks.invalidate(),
  });

  const deleteMutation = api.tasks.deleteTask.useMutation({
    onSuccess: () => utils.tasks.getTasks.invalidate(),
  });

  if (isLoading) return <p className="text-white">Loading tasks...</p>;
  if (isError) return <p className="text-red-500">Failed to load tasks.</p>;

  return (
    <div className="text-white w-full max-w-xl">
      <h2 className="text-2xl font-bold mt-6 mb-4">Latest Tasks</h2>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-center bg-white/10 rounded p-4"
          >
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-gray-300">{task.status}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateMutation.mutate({
                    id: task.id,
                    status: getNextStatus(task.status as "pending" | "in-progress" | "completed"),
                  })
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Toggle
              </button>

              <button
                onClick={() => deleteMutation.mutate({ id: task.id })}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
