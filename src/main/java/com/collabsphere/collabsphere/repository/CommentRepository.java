package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Comment;
import com.collabsphere.collabsphere.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTask(Task task);

}