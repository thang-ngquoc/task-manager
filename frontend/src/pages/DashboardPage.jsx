import { useState, useMemo } from "react";
import AppLayout from "@/layouts/AppLayout";
import TaskFilter from "@/components/tasks/TaskFilter";
import TaskList from "@/components/tasks/TaskList";
import { mockTasks } from "@/data/mockTasks";
import TaskForm from "@/components/tasks/TaskForm";

export default function DashboardPage() {
  const [filters, setFilters] = useState({ dueDate: "", priority: "" });
  const [modalMode, setModalMode] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const tasks = mockTasks;

  // ── Filter logic ──────────────────────────────────────
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filters.priority && task.priority !== filters.priority)
          return false;
        if (filters.dueDate && task.dueDate !== filters.dueDate) return false;
        return true;
      }),
    [tasks, filters],
  );

  // ── Handlers ──────────────────────────────────────────
  function handleFilterChange(change) {
    setFilters((prev) => ({ ...prev, ...change }));
  }

  function openCreate() {
    setEditingTask(null);
    setModalMode("create");
  }

  function openEdit(task) {
    setEditingTask(task);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingTask(null);
  }

  function handleSubmit(values) {
    closeModal();
  }

  function handleDelete(id) {
    // Using mock data only
  }

  function handleToggleDone(task) {
    // Using mock data only
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-foreground">
            My Tasks
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your daily workflow.
          </p>
        </div>
      </div>

      <TaskFilter onFilterChange={handleFilterChange} onNewTask={openCreate} />

      <TaskList
        tasks={filteredTasks}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleDone={handleToggleDone}
      />

      <TaskForm
        open={!!modalMode}
        onOpenChange={(open) => !open && closeModal()}
        mode={modalMode ?? "create"}
        initialValues={editingTask ?? {}}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
}
