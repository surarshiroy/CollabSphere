package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    @Override
    public void sendHtmlEmail(String to,
                              String subject,
                              String htmlBody) {

        try {
            System.out.println("========== EMAIL DEBUG START ==========");
            System.out.println("TO = " + to);
            System.out.println("MAIL_USERNAME = " + System.getenv("MAIL_USERNAME"));

            MimeMessage message = mailSender.createMimeMessage();



            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);


            helper.setFrom(System.getenv("MAIL_USERNAME"));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            System.out.println("FROM = " + System.getenv("MAIL_USERNAME"));
            System.out.println("SUBJECT = " + subject);
            System.out.println("About to call mailSender.send()");

            mailSender.send(message);

            System.out.println("========== EMAIL SENT SUCCESSFULLY ==========");

        } catch (Exception e) {
        System.out.println("=== EMAIL FAILED ===");
            System.out.println("Exception Type = " + e.getClass().getName());
            System.out.println("Message = " + e.getMessage());
        e.printStackTrace();
    }
    }

    @Override
    public void sendNotificationEmail(
            String to,
            String receiverName,
            String subject,
            String title,
            String message,
            String footer) {

        String body = """
        <html>
        <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:30px;">

            <div style="
                max-width:600px;
                margin:auto;
                background:white;
                padding:30px;
                border-radius:10px;
                box-shadow:0 0 10px rgba(0,0,0,.1);">

                <h2 style="color:#2563eb;">
                    📌 CollabSphere
                </h2>

                <p>Hello <b>%s</b>,</p>

                <h3>%s</h3>

                <p>%s</p>

                <hr>

                <p style="color:gray;font-size:13px;">
                    %s
                </p>

            </div>

        </body>
        </html>
        """.formatted(
                receiverName,
                title,
                message,
                footer
        );

        sendHtmlEmail(to, subject, body);
    }

    @Override
    public void sendTaskAssignedEmail(
            String to,
            String receiverName,
            String taskTitle,
            String assignedBy) {

        sendNotificationEmail(
                to,
                receiverName,
                "📌 New Task Assigned - CollabSphere",
                "You have been assigned a new task",
                """
                <b>Task:</b> %s
                <br><br>
                <b>Assigned By:</b> %s
                """.formatted(taskTitle, assignedBy),
                "This email was sent automatically by CollabSphere."
        );
    }
    @Override
    public void sendCommentEmail(
            String to,
            String receiverName,
            String commenter,
            String taskTitle,
            String comment) {

        sendNotificationEmail(
                to,
                receiverName,
                "💬 New Comment - CollabSphere",
                "A new comment was added",
                """
                <b>Task:</b> %s
                <br><br>
                <b>Commented By:</b> %s
                <br><br>
                <b>Comment:</b><br>
                %s
                """.formatted(taskTitle, commenter, comment),
                "This email was sent automatically by CollabSphere."
        );
    }
    @Override
    public void sendAttachmentEmail(
            String to,
            String receiverName,
            String uploader,
            String taskTitle,
            String fileName) {

        sendNotificationEmail(
                to,
                receiverName,
                "📎 New Attachment - CollabSphere",
                "A new attachment was uploaded",
                """
                <b>Task:</b> %s
                <br><br>
                <b>Uploaded By:</b> %s
                <br><br>
                <b>File:</b> %s
                """.formatted(taskTitle, uploader, fileName),
                "This email was sent automatically by CollabSphere."
        );
    }
}