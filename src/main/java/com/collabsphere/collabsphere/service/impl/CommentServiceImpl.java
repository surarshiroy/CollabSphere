package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.*;
import com.collabsphere.collabsphere.entity.*;
import com.collabsphere.collabsphere.repository.*;
import com.collabsphere.collabsphere.service.CommentService;
import com.collabsphere.collabsphere.service.EmailService;
import com.collabsphere.collabsphere.service.NotificationService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    public CommentResponse addComment(Long taskId,
                                      AddCommentRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Project project = task.getProject();
        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .task(task)
                .user(user)
                .build();

        comment = commentRepository.save(comment);
        if (task.getAssignee() != null &&
                !task.getAssignee().getId().equals(user.getId())) {

            notificationService.createNotification(
                    task.getAssignee(),
                    user.getName() + " commented on task: " + task.getTitle()
            );

            try {

                emailService.sendCommentEmail(
                        task.getAssignee().getEmail(),
                        task.getAssignee().getName(),
                        user.getName(),
                        task.getTitle(),
                        comment.getContent()
                );

            } catch (Exception e) {

                System.out.println("Email could not be sent: " + e.getMessage());

            }
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(comment.getUser().getName())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
    @Override
    public List<CommentResponse> getComments(Long taskId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Project project = task.getProject();
        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        List<Comment> comments = commentRepository.findByTask(task);

        return comments.stream()
                .map(comment -> CommentResponse.builder()
                        .id(comment.getId())
                        .content(comment.getContent())
                        .author(comment.getUser().getName())
                        .createdAt(comment.getCreatedAt())
                        .updatedAt(comment.getUpdatedAt())
                        .build())
                .toList();
    }

    @Override
    public CommentResponse updateComment(Long commentId,
                                         UpdateCommentRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        comment = commentRepository.save(comment);


        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(comment.getUser().getName())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    @Override
    public void deleteComment(Long commentId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Task task = comment.getTask();
        Project project = task.getProject();
        Team team = project.getTeam();

        TeamMember teamMember = teamMemberRepository
                .findByTeamAndUser(team, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        boolean isOwnerOrAdmin =
                teamMember.getTeamRole() == TeamRole.OWNER ||
                        teamMember.getTeamRole() == TeamRole.ADMIN;

        boolean isAuthor =
                comment.getUser().getId().equals(currentUser.getId());

        if (!isOwnerOrAdmin && !isAuthor) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}