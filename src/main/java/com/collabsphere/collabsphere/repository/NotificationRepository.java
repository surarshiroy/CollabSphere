package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Notification;
import com.collabsphere.collabsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);

}