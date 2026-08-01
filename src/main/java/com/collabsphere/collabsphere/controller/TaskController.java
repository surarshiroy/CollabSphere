package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.AssignTaskRequest;
import com.collabsphere.collabsphere.dto.CreateTaskRequest;
import com.collabsphere.collabsphere.dto.TaskResponse;
import com.collabsphere.collabsphere.dto.UpdateTaskRequest;
import com.collabsphere.collabsphere.entity.TaskPriority;
import com.collabsphere.collabsphere.entity.TaskStatus;
import com.collabsphere.collabsphere.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public TaskResponse createTask(
            @PathVariable Long projectId,
            @RequestBody CreateTaskRequest request) {

        System.out.println("=== INSIDE TASK CONTROLLER ===");

        return taskService.createTask(projectId, request);
    }

    @GetMapping
    public List<TaskResponse> getTasksByProject(
            @PathVariable Long projectId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "5")
            int size,

            @RequestParam(defaultValue = "createdAt")
            String sortBy,

            @RequestParam(defaultValue = "desc")
            String direction) {

        return taskService.getTasksByProject(
                projectId,
                page,
                size,
                sortBy,
                direction
        );
    }
    @PutMapping("/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody UpdateTaskRequest request) {

        return taskService.updateTask(taskId, request);
    }
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId) {

        taskService.deleteTask(taskId);

        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{taskId}/assign")
    public TaskResponse assignTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody AssignTaskRequest request) {

        return taskService.assignTask(taskId, request);
    }
    @GetMapping("/search")
    public List<TaskResponse> searchTasks(
            @PathVariable Long projectId,
            @RequestParam String keyword) {

        return taskService.searchTasks(projectId, keyword);
    }
    @GetMapping("/status")
    public List<TaskResponse> getTasksByStatus(
            @PathVariable Long projectId,
            @RequestParam TaskStatus status) {

        return taskService.getTasksByStatus(projectId, status);
    }
    @GetMapping("/priority")
    public List<TaskResponse> getTasksByPriority(
            @PathVariable Long projectId,
            @RequestParam TaskPriority priority) {

        return taskService.getTasksByPriority(projectId, priority);
    }
    @GetMapping("/assignee")
    public List<TaskResponse> getTasksByAssignee(
            @PathVariable Long projectId,
            @RequestParam Long userId) {

        return taskService.getTasksByAssignee(projectId, userId);
    }
}