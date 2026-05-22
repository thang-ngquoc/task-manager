import { createTask, deleteTask, getTasks, updateTask } from "@/api/tasks";
import { useEffect, useState } from "react";

export function useGetTasks() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            setError("");

            const data = await getTasks();

            setTasks(data);
        } catch (err) {
            setError(err.message || "Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return {
        tasks,
        isLoading,
        error,
        refetch: fetchTasks,
    };
}

export function useCreateTask() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateTask = async (taskData) => {
        try {
            setIsLoading(true);
            setError("");

            const newTask = await createTask(taskData);
            return newTask;
        } catch (err) {
            setError(err.message || "Failed to create task");
            throw err;
        } finally {
            setIsLoading(false);
        }       
    };

    return { 
        createTask: handleCreateTask, 
        isLoading,
        error
    };
}

export function useUpdateTask() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdateTask = async (taskId, taskData) => {
        try {
            setIsLoading(true);
            setError("");

            const modifiedTask = await updateTask(taskId, taskData);
            return modifiedTask;
        } catch (err) {
            setError(err.message || "Failed to update task");
            throw err;
        } finally {
            setIsLoading(false);
        }       
    };

    return {
        updateTask: handleUpdateTask,
        isLoading,
        error
    };
}

export function useDeleteTask() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDeleteTask = async (taskId) => {
        try {
            setIsLoading(true);
            setError("");

            const res = await deleteTask(taskId);
            return res;
        } catch (err) {
            setError(err.message || "Failed to delete task");
            throw err;
        } finally {
            setIsLoading(false);
        }       
    };

    return {
        deleteTask: handleDeleteTask,
        isLoading,
        error,
    };
}