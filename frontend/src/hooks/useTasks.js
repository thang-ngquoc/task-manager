// Tasks hooks - no backend connection, using mock data only

export function useGetTasks() {
    return {
        tasks: [],
        isLoading: false,
        error: "",
        refetch: async () => {},
    };
}

export function useCreateTask() {
    return { 
        createTask: async (taskData) => {}, 
        isLoading: false,
        error: ""
    };
}

export function useUpdateTask() {
    return {
        updateTask: async (taskId, taskData) => {},
        isLoading: false,
        error: ""
    };
}

export function useDeleteTask() {
    return {
        deleteTask: async (taskId) => {},
        isLoading: false,
        error: "",
    };
}