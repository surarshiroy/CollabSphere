package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.AssignTaskRequest;
import com.collabsphere.collabsphere.dto.CreateTaskRequest;
import com.collabsphere.collabsphere.dto.TaskResponse;
import com.collabsphere.collabsphere.dto.UpdateTaskRequest;
import com.collabsphere.collabsphere.entity.*;
import com.collabsphere.collabsphere.repository.ProjectRepository;
import com.collabsphere.collabsphere.repository.TaskRepository;
import com.collabsphere.collabsphere.repository.TeamMemberRepository;
import com.collabsphere.collabsphere.repository.UserRepository;
import com.collabsphere.collabsphere.service.TaskService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Override
    public TaskResponse createTask(Long projectId, CreateTaskRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        TeamMember teamMember = teamMemberRepository
                .findByTeamAndUser(team, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this team"));

        if (teamMember.getTeamRole() != TeamRole.OWNER &&
                teamMember.getTeamRole() != TeamRole.ADMIN) {

            throw new RuntimeException("Only OWNER or ADMIN can create tasks");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TaskStatus.TODO)
                .createdAt(LocalDateTime.now())
                .project(project)
                .createdBy(user)
                .build();

        task = taskRepository.save(task);

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .createdBy(task.getCreatedBy().getName())
                .assignee(task.getAssignee() != null
                        ? task.getAssignee().getName()
                        : null)
                .createdAt(task.getCreatedAt())
                .build();
    }

    @Override
    public List<TaskResponse> getTasksByProject(Long projectId) {


        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        List<Task> tasks = taskRepository.findByProject(project);

        return tasks.stream()
                .map(task -> TaskResponse.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .description(task.getDescription())
                        .status(task.getStatus())
                        .priority(task.getPriority())
                        .createdBy(task.getCreatedBy().getName())
                        .assignee(task.getAssignee() != null
                                ? task.getAssignee().getName()
                                : null)
                        .createdAt(task.getCreatedAt())
                        .build())
                .toList();
    }
    @Override
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Project project = task.getProject();
        Team team = project.getTeam();

        TeamMember teamMember = teamMemberRepository
                .findByTeamAndUser(team, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this team"));

        if (teamMember.getTeamRole() != TeamRole.OWNER &&
                teamMember.getTeamRole() != TeamRole.ADMIN) {

            throw new RuntimeException("Only OWNER or ADMIN can update tasks");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());

        task = taskRepository.save(task);

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .createdBy(task.getCreatedBy().getName())
                .assignee(task.getAssignee() != null
                        ? task.getAssignee().getName()
                        : null)
                .createdAt(task.getCreatedAt())
                .build();
    }

    @Override
    public void deleteTask(Long taskId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Project project = task.getProject();
        Team team = project.getTeam();

        TeamMember teamMember = teamMemberRepository
                .findByTeamAndUser(team, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this team"));

        if (teamMember.getTeamRole() != TeamRole.OWNER) {
            throw new RuntimeException("Only OWNER can delete tasks");
        }

        taskRepository.delete(task);
    }
    @Override
    public TaskResponse assignTask(Long taskId, AssignTaskRequest request) {

        System.out.println("Inside assignTask()");

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Project project = task.getProject();
        Team team = project.getTeam();

        TeamMember currentMember = teamMemberRepository
                .findByTeamAndUser(team, currentUser)
                .orElseThrow(() -> new RuntimeException("You are not a member of this team"));

        if (currentMember.getTeamRole() != TeamRole.OWNER &&
                currentMember.getTeamRole() != TeamRole.ADMIN) {

            throw new RuntimeException("Only OWNER or ADMIN can assign tasks");
        }

        User assignee = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));

        teamMemberRepository.findByTeamAndUser(team, assignee)
                .orElseThrow(() -> new RuntimeException("Assignee is not a member of this team"));

        task.setAssignee(assignee);

        task = taskRepository.save(task);

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .createdBy(task.getCreatedBy().getName())
                .assignee(task.getAssignee().getName())
                .createdAt(task.getCreatedAt())
                .build();
    }
}