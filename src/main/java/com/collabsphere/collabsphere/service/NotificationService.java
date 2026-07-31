package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.NotificationResponse;
import com.collabsphere.collabsphere.entity.User;

import java.util.List;

public interface NotificationService {

    void createNotification(User user, String message);

    List<NotificationResponse> getMyNotifications();

    NotificationResponse markAsRead(Long notificationId);

    void deleteNotification(Long notificationId);
}