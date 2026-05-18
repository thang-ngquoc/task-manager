import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";

export default function TaskCard({ task }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <span>{task.status}</span>
                <span>{task.priority}</span>
            </CardHeader>
            <CardContent>
                <p>{task.description}</p>
                <p>{task.dueDate}</p>
            </CardContent>
            <CardFooter>
                <Button>Edit</Button>
                <Button variant="destructive">Delete</Button>
            </CardFooter>
        </Card>
    );
}