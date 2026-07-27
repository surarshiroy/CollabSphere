package com.collabsphere.collabsphere.service.impl;
import com.collabsphere.collabsphere.dto.AddMemberRequest;
import com.collabsphere.collabsphere.dto.TeamResponse;
import org.springframework.transaction.annotation.Transactional;
import com.collabsphere.collabsphere.dto.CreateTeamRequest;
import com.collabsphere.collabsphere.repository.TeamMemberRepository;
import com.collabsphere.collabsphere.repository.TeamRepository;
import com.collabsphere.collabsphere.repository.UserRepository;
import com.collabsphere.collabsphere.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.collabsphere.collabsphere.entity.Team;
import com.collabsphere.collabsphere.entity.TeamMember;
import com.collabsphere.collabsphere.entity.TeamRole;
import com.collabsphere.collabsphere.entity.User;
import com.collabsphere.collabsphere.util.SecurityUtil;

import java.time.LocalDateTime;
import java.util.List;
import com.collabsphere.collabsphere.dto.AddMemberRequest;
import com.collabsphere.collabsphere.entity.Team;
import com.collabsphere.collabsphere.entity.TeamMember;
import com.collabsphere.collabsphere.entity.TeamRole;
import com.collabsphere.collabsphere.entity.User;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createTeam(CreateTeamRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = Team.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        teamRepository.save(team);

        TeamMember teamMember = TeamMember.builder()
                .team(team)
                .user(user)
                .teamRole(TeamRole.OWNER)
                .joinedAt(LocalDateTime.now())
                .build();

        teamMemberRepository.save(teamMember);
    }
    @Override
    public List<TeamResponse> getMyTeams() {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return teamMemberRepository.findByUser(user)
                .stream()
                .map(member -> TeamResponse.builder()
                        .id(member.getTeam().getId())
                        .name(member.getTeam().getName())
                        .description(member.getTeam().getDescription())
                        .role(member.getTeamRole())
                        .build())
                .toList();
    }
    @Override
    @Transactional
    public void addMember(Long teamId, AddMemberRequest request) {
        System.out.println("===== INSIDE addMember =====");
        String email = SecurityUtil.getCurrentUserEmail();
        System.out.println("Logged in user: " + email);




        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        TeamMember currentMember = teamMemberRepository
                .findByTeamAndUser(team, currentUser)
                .orElseThrow(() -> new RuntimeException("You are not a member of this team"));

        if (currentMember.getTeamRole() != TeamRole.OWNER &&
                currentMember.getTeamRole() != TeamRole.ADMIN) {

            throw new RuntimeException("Only OWNER or ADMIN can add members");
        }

        User newMember = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (teamMemberRepository.findByTeamAndUser(team, newMember).isPresent()) {
            throw new RuntimeException("User is already a member of this team");


        }


        TeamMember member = TeamMember.builder()
                .team(team)
                .user(newMember)
                .teamRole(request.getRole())
                .joinedAt(LocalDateTime.now())
                .build();

        teamMemberRepository.save(member);
    }
}