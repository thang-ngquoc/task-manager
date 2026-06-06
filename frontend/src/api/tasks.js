import { getIdToken } from "./auth";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000";

const getAuthHeaders = async () => {
    const token = await getIdToken();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = payload;
        throw error;
    } 

    return payload;
}

export const getTasks = async () => {
    const response = await fetch(`${API_ENDPOINT}/tasks`, {
            method: "GET",
            headers: await getAuthHeaders(),
    });
        
    const payload = await handleResponse(response);
    return payload?.data || [];
}

export const createTask = async (taskData) => {
    const response = await fetch(`${API_ENDPOINT}/tasks`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    const payload = await handleResponse(response);
    return payload?.data;
}

export const updateTask = async (taskId, taskData) => {
    const response = await fetch(`${API_ENDPOINT}/tasks/${taskId}`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    const payload = await handleResponse(response);
    return payload?.data;
}

export const deleteTask = async (taskId) => {
    const response = await fetch(`${API_ENDPOINT}/tasks/${taskId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
    });
    return handleResponse(response);
}
