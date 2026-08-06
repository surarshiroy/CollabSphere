package com.collabsphere.collabsphere.service;

public interface EmailService {

    void sendHtmlEmail(String to,
                       String subject,
                       String htmlBody);

    void sendNotificationEmail(
            String to,
            String receiverName,
            String subject,
            String title,
            String message,
            String footer
    );

    void sendTaskAssignedEmail(
            String to,
            String receiverName,
            String taskTitle,
            String assignedBy
    );

    void sendCommentEmail(
            String to,
            String receiverName,
            String commenter,
            String taskTitle,
            String comment
    );

    void sendAttachmentEmail(
            String to,
            String receiverName,
            String uploader,
            String taskTitle,
            String fileName
    );

}