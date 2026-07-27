package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findById(Long id);
}