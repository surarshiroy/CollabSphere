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
import com.collabsphere.collabsphere.service.EmailService;
import com.collabsphere.collabsphere.service.NotificationService;
import com.collabsphere.collabsphere.service.TaskService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import com.collabsphere.collabsphere.service.NotificationService;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;


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
                .deadline(request.getDeadline())
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
                .deadline(task.getDeadline())
                .build();
    }

    @Override
    public List<TaskResponse> getTasksByProject(
            Long projectId,
            int page,
            int size,
            String sortBy,
            String direction) {


        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Task> taskPage = taskRepository.findByProject(project, pageable);

        List<Task> tasks = taskPage.getContent();

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
                        .deadline(task.getDeadline())
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
        task.setDeadline(request.getDeadline());

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
                .deadline(task.getDeadline())
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
        System.out.println("========== ASSIGN DEBUG ==========");
        System.out.println("Current user: " + currentUser.getEmail());
        System.out.println("Team: " + team.getName());
        System.out.println("Team role: " + currentMember.getTeamRole());
        System.out.println("Requested assignee ID: " + request.getUserId());
        System.out.println("=================================");

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
        notificationService.createNotification(
                assignee,
                "You have been assigned to task: " + task.getTitle()
        );

        System.out.println("=== BEFORE EMAIL ===");

        try {
            emailService.sendTaskAssignedEmail(
                    assignee.getEmail(),
                    assignee.getName(),
                    task.getTitle(),
                    currentUser.getName()
            );

            System.out.println("=== EMAIL SENT SUCCESSFULLY ===");

        } catch (Exception e) {
            System.out.println("=== EMAIL FAILED ===");
            e.printStackTrace();
        }

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .createdBy(task.getCreatedBy().getName())
                .assignee(task.getAssignee().getName())
                .createdAt(task.getCreatedAt())
                .deadline(task.getDeadline())
                .build();
    }
    @Override
    public List<TaskResponse> searchTasks(Long projectId, String keyword) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        List<Task> tasks =
                taskRepository.findByProjectAndTitleContainingIgnoreCase(
                        project,
                        keyword
                );

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
                        .deadline(task.getDeadline())
                        .build())
                .toList();
    }

    @Override
    public List<TaskResponse> getTasksByStatus(Long projectId, TaskStatus status) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        List<Task> tasks = taskRepository.findByProjectAndStatus(project, status);

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
                        .deadline(task.getDeadline())
                        .build())
                .toList();
    }
    @Override
    public List<TaskResponse> getTasksByPriority(Long projectId, TaskPriority priority) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        List<Task> tasks = taskRepository.findByProjectAndPriority(project, priority);

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
                        .deadline(task.getDeadline())
                        .build())
                .toList();
    }
    @Override
    public List<TaskResponse> getTasksByAssignee(Long projectId, Long userId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Task> tasks = taskRepository.findByProjectAndAssignee(project, assignee);

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
                        .deadline(task.getDeadline())
                        .build())
                .toList();
    }
}