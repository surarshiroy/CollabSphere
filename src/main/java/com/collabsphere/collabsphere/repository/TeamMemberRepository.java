package com.collabsphere.collabsphere.repository;

import com.collabsphere.collabsphere.entity.Team;
import com.collabsphere.collabsphere.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import com.collabsphere.collabsphere.entity.User;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByUser(User user);
    Optional<TeamMember> findByTeamAndUser(Team team, User user);

    List<TeamMember> findByTeam(Team team);
}