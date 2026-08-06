package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.NotificationResponse;
import com.collabsphere.collabsphere.entity.Notification;
import com.collabsphere.collabsphere.entity.User;
import com.collabsphere.collabsphere.repository.NotificationRepository;
import com.collabsphere.collabsphere.repository.UserRepository;
import com.collabsphere.collabsphere.service.NotificationService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void createNotification(User user, String message) {

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        NotificationResponse response = NotificationResponse.builder()
                .id(savedNotification.getId())
                .message(savedNotification.getMessage())
                .isRead(savedNotification.isRead())
                .createdAt(savedNotification.getCreatedAt())
                .build();

        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                response
        );
    }

    @Override
    public List<NotificationResponse> getMyNotifications() {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(notification -> NotificationResponse.builder()
                        .id(notification.getId())
                        .message(notification.getMessage())
                        .isRead(notification.isRead())
                        .createdAt(notification.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long notificationId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to update this notification");
        }

        notification.setRead(true);

        Notification savedNotification = notificationRepository.save(notification);

        return NotificationResponse.builder()
                .id(savedNotification.getId())
                .message(savedNotification.getMessage())
                .isRead(savedNotification.isRead())
                .createdAt(savedNotification.getCreatedAt())
                .build();
    }

    @Override
    public void deleteNotification(Long notificationId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException(
                    "You are not authorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }
}