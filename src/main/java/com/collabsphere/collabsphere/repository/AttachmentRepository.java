package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Attachment;
import com.collabsphere.collabsphere.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository
        extends JpaRepository<Attachment, Long> {

    List<Attachment> findByTask(Task task);

}