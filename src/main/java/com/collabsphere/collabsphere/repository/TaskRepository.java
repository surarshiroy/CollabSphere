package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Project;
import com.collabsphere.collabsphere.entity.Task;
import com.collabsphere.collabsphere.entity.TaskPriority;
import com.collabsphere.collabsphere.entity.TaskStatus;
import com.collabsphere.collabsphere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByProject(Project project, Pageable pageable);

    long countByCreatedBy(User user);

    long countByAssignee(User user);

    long countByAssigneeAndStatus(User user, TaskStatus status);

    // Search by title
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

    // Delete all tasks belonging to a project
    void deleteByProject(Project project);
}