package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface AttachmentService {

    AttachmentResponse uploadAttachment(
            Long taskId,
            MultipartFile file
    ) throws IOException;

    List<AttachmentResponse> getAttachments(
            Long taskId
    );

    byte[] downloadAttachment(
            Long attachmentId
    );

    void deleteAttachment(
            Long attachmentId
    );
}