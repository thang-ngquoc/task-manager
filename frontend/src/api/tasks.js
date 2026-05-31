import { getAccessToken } from "./auth";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000";

const getAuthHeaders = async () => {
    const token = await getAccessToken();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = await response.json();
        throw error;
    } 

    return await response.json();
}

export const getTasks = async () => {
    const response = await fetch(`${API_ENDPOINT}/tasks`, {
            method: "GET",
            headers: await getAuthHeaders(),
    });
        
    return await handleResponse(response);
}

export const createTask = async (taskData) => {
    const response = await fetch(`${API_ENDPOINT}/tasks`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    return await handleResponse(response);
}

export const updateTask = async (taskId, taskData) => {
    const response = await fetch(`${API_ENDPOINT}/tasks/${taskId}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    return await handleResponse(response);
}

export const deleteTask = async (taskId) => {
    const response = await fetch(`${API_ENDPOINT}/tasks/${taskId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
    });
    return handleResponse(response);
}