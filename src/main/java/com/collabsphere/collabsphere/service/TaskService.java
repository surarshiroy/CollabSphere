package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.AssignTaskRequest;
import com.collabsphere.collabsphere.dto.CreateTaskRequest;
import com.collabsphere.collabsphere.dto.TaskResponse;
import com.collabsphere.collabsphere.dto.UpdateTaskRequest;
import com.collabsphere.collabsphere.entity.TaskPriority;
import com.collabsphere.collabsphere.entity.TaskStatus;

import java.util.List;

public interface TaskService {


    TaskResponse updateTask(Long taskId, UpdateTaskRequest request);

    TaskResponse createTask(Long projectId, CreateTaskRequest request);

    List<TaskResponse> getTasksByProject(Long projectId);
    void deleteTask(Long taskId);
    TaskResponse assignTask(Long taskId, AssignTaskRequest request);
    List<TaskResponse> searchTasks(Long projectId, String keyword);

    List<TaskResponse> getTasksByStatus(Long projectId, TaskStatus status);

    List<TaskResponse> getTasksByPriority(Long projectId, TaskPriority priority);

    List<TaskResponse> getTasksByAssignee(Long projectId, Long userId);


}