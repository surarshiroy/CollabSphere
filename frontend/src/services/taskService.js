import api from "../api/axios";

// ========================================
// GET TASKS FOR A PROJECT
// ========================================

export const getTasksByProject = async (
    projectId,
    page = 0,
    size = 50,
    sortBy = "createdAt",
    direction = "desc"
) => {

    const response = await api.get(
        `/projects/${projectId}/tasks`,
        {
            params: {
                page,
                size,
                sortBy,
                direction
            }
        }
    );

    return response.data;
};


// ========================================
// CREATE TASK
// ========================================

export const createTask = async (
    projectId,
    taskData
) => {

    const response = await api.post(
        `/projects/${projectId}/tasks`,
        taskData
    );

    return response.data;
};


// ========================================
// UPDATE TASK
// ========================================

export const updateTask = async (
    projectId,
    taskId,
    taskData
) => {

    const response = await api.put(
        `/projects/${projectId}/tasks/${taskId}`,
        taskData
    );

    return response.data;
};


// ========================================
// DELETE TASK
// ========================================

export const deleteTask = async (
    projectId,
    taskId
) => {

    const response = await api.delete(
        `/projects/${projectId}/tasks/${taskId}`
    );

    return response.data;
};


// ========================================
// ASSIGN TASK
// ========================================

export const assignTask = async (
    projectId,
    taskId,
    userId
) => {

    const response = await api.put(
        `/projects/${projectId}/tasks/${taskId}/assign`,
        {
            userId
        }
    );

    return response.data;
};


// ========================================
// SEARCH TASKS
// ========================================

export const searchTasks = async (
    projectId,
    keyword
) => {

    const response = await api.get(
        `/projects/${projectId}/tasks/search`,
        {
            params: {
                keyword
            }
        }
    );

    return response.data;
};


// ========================================
// FILTER BY STATUS
// ========================================

export const getTasksByStatus = async (
    projectId,
    status
) => {

    const response = await api.get(
        `/projects/${projectId}/tasks/status`,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};


// ========================================
// FILTER BY PRIORITY
// ========================================

export const getTasksByPriority = async (
    projectId,
    priority
) => {

    const response = await api.get(
        `/projects/${projectId}/tasks/priority`,
        {
            params: {
                priority
            }
        }
    );

    return response.data;
};


// ========================================
// FILTER BY ASSIGNEE
// ========================================

export const getTasksByAssignee = async (
    projectId,
    userId
) => {

    const response = await api.get(
        `/projects/${projectId}/tasks/assignee`,
        {
            params: {
                userId
            }
        }
    );

    return response.data;
};