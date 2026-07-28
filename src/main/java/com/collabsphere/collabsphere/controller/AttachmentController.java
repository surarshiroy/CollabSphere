package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.AttachmentResponse;
import com.collabsphere.collabsphere.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tasks/{taskId}/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping
    public AttachmentResponse uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file)
            throws IOException {

        return attachmentService.uploadAttachment(taskId, file);
    }

    @GetMapping
    public List<AttachmentResponse> getAttachments(
            @PathVariable Long taskId) {

        return attachmentService.getAttachments(taskId);
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable Long attachmentId) {

        byte[] file = attachmentService.downloadAttachment(attachmentId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment")
                .body(file);
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long attachmentId) {

        attachmentService.deleteAttachment(attachmentId);

        return ResponseEntity.noContent().build();
    }
}