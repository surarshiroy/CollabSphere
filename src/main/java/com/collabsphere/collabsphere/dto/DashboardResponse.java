package com.collabsphere.collabsphere.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardResponse {

    private long totalProjects;

    private long totalTasks;

    private long tasksAssignedToMe;

    private long completedTasks;

    private long inProgressTasks;

    private long todoTasks;

    private long unreadNotifications;
}