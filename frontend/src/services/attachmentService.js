import api from "../api/axios";

// ========================================
// GET ATTACHMENTS FOR A TASK
// ========================================

export const getAttachments = async (taskId) => {

    const response = await api.get(
        `/tasks/${taskId}/attachments`
    );

    return response.data;
};


// ========================================
// UPLOAD ATTACHMENT
// ========================================

export const uploadAttachment = async (
    taskId,
    file
) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        `/tasks/${taskId}/attachments`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};


// ========================================
// DOWNLOAD ATTACHMENT
// ========================================

export const downloadAttachment = async (
    taskId,
    attachmentId
) => {

    const response = await api.get(
        `/tasks/${taskId}/attachments/${attachmentId}`,
        {
            responseType: "blob"
        }
    );

    return response;
};


// ========================================
// DELETE ATTACHMENT
// ========================================

export const deleteAttachment = async (
    taskId,
    attachmentId
) => {

    const response = await api.delete(
        `/tasks/${taskId}/attachments/${attachmentId}`
    );

    return response.data;
};