import TaskCard from "@/components/tasks/TaskCard";

export default function TaskList({ tasks, onEdit, onDelete, onToggleDone }) {
    if (!tasks?.length) {
        return (
            <div className="glass rounded-2xl py-16 text-center text-muted-foreground text-sm">
                No tasks found. Create one to get started!
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {tasks.map((task) => (
                <TaskCard 
                    key={task.taskId} 
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleDone={onToggleDone} 
                />
            ))}
        </div>
    );
}