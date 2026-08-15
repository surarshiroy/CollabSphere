import api from "../api/axios";

// ========================================
// GET COMMENTS FOR A TASK
// ========================================

export const getComments = async (taskId) => {

    const response = await api.get(
        `/tasks/${taskId}/comments`
    );

    return response.data;
};


// ========================================
// ADD COMMENT
// ========================================

export const addComment = async (taskId, content) => {

    const response = await api.post(
        `/tasks/${taskId}/comments`,
        {
            content
        }
    );

    return response.data;
};


// ========================================
// UPDATE COMMENT
// ========================================

export const updateComment = async (
    taskId,
    commentId,
    content
) => {

    const response = await api.put(
        `/tasks/${taskId}/comments/${commentId}`,
        {
            content
        }
    );

    return response.data;
};


// ========================================
// DELETE COMMENT
// ========================================

export const deleteComment = async (
    taskId,
    commentId
) => {

    const response = await api.delete(
        `/tasks/${taskId}/comments/${commentId}`
    );

    return response.data;
};