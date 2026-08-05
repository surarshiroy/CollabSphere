package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.DashboardResponse;
import com.collabsphere.collabsphere.entity.TaskStatus;
import com.collabsphere.collabsphere.entity.User;
import com.collabsphere.collabsphere.repository.NotificationRepository;
import com.collabsphere.collabsphere.repository.ProjectRepository;
import com.collabsphere.collabsphere.repository.TaskRepository;
import com.collabsphere.collabsphere.repository.UserRepository;
import com.collabsphere.collabsphere.service.DashboardService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public DashboardResponse getDashboard() {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalProjects =
                projectRepository.countByCreatedBy(user);

        long totalTasks =
                taskRepository.countByCreatedBy(user);

        long assignedTasks =
                taskRepository.countByAssignee(user);

        long completedTasks =
                taskRepository.countByAssigneeAndStatus(
                        user,
                        TaskStatus.DONE
                );

        long inProgressTasks =
                taskRepository.countByAssigneeAndStatus(
                        user,
                        TaskStatus.IN_PROGRESS
                );

        long todoTasks =
                taskRepository.countByAssigneeAndStatus(
                        user,
                        TaskStatus.TODO
                );

        long unreadNotifications =
                notificationRepository.countByUserAndIsReadFalse(user);

        return DashboardResponse.builder()
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .tasksAssignedToMe(assignedTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks)
                .unreadNotifications(unreadNotifications)
                .build();
    }
}