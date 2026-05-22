import { useState, useMemo } from "react";
import AppLayout from "@/layouts/AppLayout";
import TaskFilter from "@/components/tasks/TaskFilter";
import TaskList from "@/components/tasks/TaskList";
import { mockTasks } from "@/data/mockTasks";
import TaskForm from "@/components/tasks/TaskForm";
import { useCreateTask, useDeleteTask, useGetTasks, useUpdateTask } from "@/hooks/useTasks";

export default function DashboardPage() {
    const [filters,     setFilters]     = useState({ dueDate: "", priority: "" });
    const [modalMode,   setModalMode]   = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    const { isLoading, error, refetch } = useGetTasks();
    const { createTask } = useCreateTask();
    const { updateTask } = useUpdateTask();
    const { deleteTask } = useDeleteTask();

    const tasks = mockTasks; // Replace with actual data from useGetTasks when API is ready

    // ── Filter logic ──────────────────────────────────────
    const filteredTasks = useMemo(() => tasks.filter(task => {
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.dueDate  && task.dueDate  !== filters.dueDate)  return false;
        return true;
    }), [tasks, filters]);

    // ── Handlers ──────────────────────────────────────────
    function handleFilterChange(change) {
        setFilters(prev => ({ ...prev, ...change }));
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

    async function handleSubmit(values) {
        try {
            if (modalMode === "create") await createTask(values);
            else await updateTask(values);

            await refetch();
            closeModal();
        } catch (err) {
            console.error(err);
        }
    }

    async function handleDelete(id) {
        try {
            await deleteTask(id);
            await refetch();
        } catch (err) {
            console.error(err);
        }
    }

    async function handleToggleDone(task) {
        try {
            await updateTask(task.taskId, {
                ...task,
                status:
                    task.status === "completed"
                        ? "pending"
                        : "completed",
            });

            await refetch();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <AppLayout>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-[22px] font-extrabold text-foreground">My Tasks</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your daily workflow.</p>
                </div>
            </div>

            <TaskFilter
                onFilterChange={handleFilterChange}
                onNewTask={openCreate}
            />

            <TaskList
                tasks={filteredTasks}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleDone={handleToggleDone}
            />

            <TaskForm
                open={!!modalMode}
                onOpenChange={open => !open && closeModal()}
                mode={modalMode ?? "create"}
                initialValues={editingTask ?? {}}
                onSubmit={handleSubmit}
            />
        </AppLayout>
    );
}