import api from "../api/axios";


// =========================================
// GET MY NOTIFICATIONS
// =========================================

export const getMyNotifications = async () => {

    const response = await api.get(
        "/notifications"
    );

    return response.data;

};


// =========================================
// MARK NOTIFICATION AS READ
// =========================================

export const markNotificationAsRead = async (
    notificationId
) => {

    const response = await api.put(
        `/notifications/${notificationId}/read`
    );

    return response.data;

};


// =========================================
// DELETE NOTIFICATION
// =========================================

export const deleteNotification = async (
    notificationId
) => {

    await api.delete(
        `/notifications/${notificationId}`
    );

};