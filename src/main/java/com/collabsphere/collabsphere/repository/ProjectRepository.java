package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Project;
import com.collabsphere.collabsphere.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import com.collabsphere.collabsphere.entity.User;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByTeam(Team team);
    long countByCreatedBy(User user);

}