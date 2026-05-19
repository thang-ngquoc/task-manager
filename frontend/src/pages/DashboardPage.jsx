import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import TaskFilter from "@/components/tasks/TaskFilter";
import TaskList from "@/components/tasks/TaskList";
import { mockTasks } from "@/data/mockTasks";

export default function DashboardPage() {
    return (
        <AppLayout>
            <TaskFilter />
            <TaskList tasks={mockTasks} />
        </AppLayout>
    );
}