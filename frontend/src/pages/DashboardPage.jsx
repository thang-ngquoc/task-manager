import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import TaskFilter from "@/components/tasks/TaskFilter";
import TaskList from "@/components/tasks/TaskList";
import { mockTasks } from "@/data/mockTasks";
import TaskForm from "@/components/tasks/TaskForm";

export default function DashboardPage() {
    const [tasks,       setTasks]       = useState(mockTasks);
    const [filters,     setFilters]     = useState({ dueDate: "", priority: "" });
    const [modalMode,   setModalMode]   = useState(null);   // "create" | "edit" | null
    const [editingTask, setEditingTask] = useState(null);

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

    function handleSubmit(values) {
        if (modalMode === "create") {
            setTasks(prev => [...prev, { id: Date.now(), ...values }]);
        } else {
            setTasks(prev => prev.map(t =>
                t.id === editingTask.id ? { ...t, ...values } : t
            ));
        }
    }

    function handleDelete(id) {
        setTasks(prev => prev.filter(t => t.id !== id));
    }

    function handleToggleDone(id) {
        setTasks(prev => prev.map(t =>
            t.id === id
                ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
                : t
        ));
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