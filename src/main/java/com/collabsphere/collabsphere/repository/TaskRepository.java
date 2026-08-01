package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Project;
import com.collabsphere.collabsphere.entity.Task;
import com.collabsphere.collabsphere.entity.TaskPriority;
import com.collabsphere.collabsphere.entity.TaskStatus;
import com.collabsphere.collabsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProject(Project project);

    // Search by title (case-insensitive)
    List<Task> findByProjectAndTitleContainingIgnoreCase(
            Project project,
            String keyword
    );

    // Filter by status
    List<Task> findByProjectAndStatus(
            Project project,
            TaskStatus status
    );

    // Filter by priority
    List<Task> findByProjectAndPriority(
            Project project,
            TaskPriority priority
    );

    // Filter by assignee
    List<Task> findByProjectAndAssignee(
            Project project,
            User assignee
    );
}