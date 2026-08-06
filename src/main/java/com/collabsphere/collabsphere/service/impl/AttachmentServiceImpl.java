package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.AttachmentResponse;
import com.collabsphere.collabsphere.entity.*;
import com.collabsphere.collabsphere.repository.*;
import com.collabsphere.collabsphere.service.EmailService;
import com.collabsphere.collabsphere.service.NotificationService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import com.collabsphere.collabsphere.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    public AttachmentResponse uploadAttachment(Long taskId,
                                               MultipartFile file)
            throws IOException {

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

        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .fileData(file.getBytes())
                .uploadedAt(LocalDateTime.now())
                .task(task)
                .uploadedBy(user)
                .build();

        attachment = attachmentRepository.save(attachment);

        System.out.println("========== ATTACHMENT DEBUG ==========");
        System.out.println("Current User : " + user.getName() + " (ID=" + user.getId() + ")");
        System.out.println("Task         : " + task.getTitle());

        if (task.getAssignee() == null) {
            System.out.println("Task Assignee: NULL");
        } else {
            System.out.println("Task Assignee: "
                    + task.getAssignee().getName()
                    + " (ID=" + task.getAssignee().getId() + ")");
        }

        if (task.getAssignee() != null &&
                !task.getAssignee().getId().equals(user.getId())) {

            notificationService.createNotification(
                    task.getAssignee(),
                    user.getName() + " uploaded \"" +
                            attachment.getFileName() +
                            "\" to task: " + task.getTitle()
            );

            try {

                emailService.sendAttachmentEmail(
                        task.getAssignee().getEmail(),
                        task.getAssignee().getName(),
                        user.getName(),
                        task.getTitle(),
                        attachment.getFileName()
                );

            } catch (Exception e) {

                System.out.println("Email could not be sent: " + e.getMessage());

            }
        }

        return AttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .uploadedBy(user.getName())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
    @Override
    public List<AttachmentResponse> getAttachments(Long taskId) {

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

        List<Attachment> attachments = attachmentRepository.findByTask(task);

        return attachments.stream()
                .map(attachment -> AttachmentResponse.builder()
                        .id(attachment.getId())
                        .fileName(attachment.getFileName())
                        .contentType(attachment.getContentType())
                        .fileSize(attachment.getFileSize())
                        .uploadedBy(attachment.getUploadedBy().getName())
                        .uploadedAt(attachment.getUploadedAt())
                        .build())
                .toList();
    }

    @Override
    public byte[] downloadAttachment(Long attachmentId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Task task = attachment.getTask();
        Project project = task.getProject();
        Team team = project.getTeam();

        teamMemberRepository.findByTeamAndUser(team, user)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        return attachment.getFileData();
    }

    @Override
    public void deleteAttachment(Long attachmentId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Task task = attachment.getTask();
        Project project = task.getProject();
        Team team = project.getTeam();

        TeamMember teamMember = teamMemberRepository
                .findByTeamAndUser(team, currentUser)
                .orElseThrow(() ->
                        new RuntimeException("You are not a member of this team"));

        boolean isOwnerOrAdmin =
                teamMember.getTeamRole() == TeamRole.OWNER ||
                        teamMember.getTeamRole() == TeamRole.ADMIN;

        boolean isUploader =
                attachment.getUploadedBy().getId().equals(currentUser.getId());

        if (!isOwnerOrAdmin && !isUploader) {
            throw new RuntimeException(
                    "You are not authorized to delete this attachment");
        }

        attachmentRepository.delete(attachment);
    }

}