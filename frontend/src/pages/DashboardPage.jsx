import AppLayout from "@/components/layout/AppLayout";
import TaskFilters from "@/components/tasks/TaskFilter";
import TaskList from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { mockTasks } from "@/data/mockTasks";

export default function DashboardPage() {
    return (
        <AppLayout>
            <div>
                <div>
                    <h1>My Tasks</h1>
                    <p>Manage your daily workflow.</p>
                </div>

                <Button>New Task</Button>
            </div>

            <TaskFilters />
            <TaskList tasks={mockTasks} />
        </AppLayout>
    );
}