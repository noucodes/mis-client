"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface Task {
  task_id: number;
  task_name: string;
  is_completed: boolean;
}

interface ChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: number;
  applicantName: string;
}

export function ChecklistModal({
  open,
  onOpenChange,
  applicantId,
  applicantName,
}: ChecklistModalProps) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch tasks when modal opens
  React.useEffect(() => {
    if (open) fetchTasks();
  }, [open, applicantId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/${applicantId}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { tasks } = response.data;
      if (!Array.isArray(tasks)) throw new Error("Invalid tasks format");
      setTasks(tasks);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async (taskId: number, newStatus: boolean) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/${applicantId}/tasks/${taskId}`,
        { isCompleted: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save task", err);
      setError("Failed to update task");

      // Rollback UI on error
      setTasks(prev =>
        prev.map(t =>
          t.task_id === taskId ? { ...t, is_completed: !newStatus } : t
        )
      );
    }
  };

  const handleCheckboxChange = (taskId: number, checked: boolean | "indeterminate") => {
    const newStatus = checked === true;

    // Update UI immediately
    setTasks(prev =>
      prev.map(t => (t.task_id === taskId ? { ...t, is_completed: newStatus } : t))
    );

    // Instant save
    saveTask(taskId, newStatus);
  };

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{applicantName} - Onboarding Checklist</DialogTitle>
          <DialogDescription>View and manage onboarding tasks.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedCount} of {totalCount} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
          ) : error ? (
            <div className="py-8 text-center text-destructive">{error}</div>
          ) : (
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks available.</div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.task_id}
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`task-${task.task_id}`}
                      checked={task.is_completed}
                      onCheckedChange={checked => handleCheckboxChange(task.task_id, checked)}
                    />
                    <label
                      htmlFor={`task-${task.task_id}`}
                      className="flex-1 cursor-pointer text-sm font-medium leading-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className={task.is_completed ? "line-through text-muted-foreground" : ""}>
                          {task.task_name}
                        </span>
                      </div>
                    </label>
                    {task.is_completed && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
