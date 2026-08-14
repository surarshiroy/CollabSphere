package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.CreateProjectRequest;
import com.collabsphere.collabsphere.dto.ProjectResponse;
import com.collabsphere.collabsphere.dto.UpdateProjectRequest;
import com.collabsphere.collabsphere.entity.*;
import com.collabsphere.collabsphere.repository.ProjectRepository;
import com.collabsphere.collabsphere.repository.TaskRepository;
import com.collabsphere.collabsphere.repository.TeamMemberRepository;
import com.collabsphere.collabsphere.repository.TeamRepository;
import com.collabsphere.collabsphere.repository.UserRepository;
import com.collabsphere.collabsphere.service.ProjectService;
import com.collabsphere.collabsphere.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;


    @Override
    public ProjectResponse createProject(
            Long teamId,
            CreateProjectRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RuntimeException("Team not found"));

        TeamMember currentMember = teamMemberRepository
                .findByTeamAndUser(team, loggedInUser)
                .orElseThrow(() ->
                        new RuntimeException(
                                "You are not a member of this team"
                        ));

        if (currentMember.getTeamRole() != TeamRole.OWNER &&
                currentMember.getTeamRole() != TeamRole.ADMIN) {

            throw new RuntimeException(
                    "Only OWNER or ADMIN can create projects"
            );
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(ProjectStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deadline(request.getDeadline())
                .team(team)
                .createdBy(loggedInUser)
                .build();

        Project savedProject = projectRepository.save(project);

        return ProjectResponse.builder()
                .id(savedProject.getId())
                .name(savedProject.getName())
                .description(savedProject.getDescription())
                .status(savedProject.getStatus())
                .createdBy(savedProject.getCreatedBy().getName())
                .createdAt(savedProject.getCreatedAt())
                .deadline(savedProject.getDeadline())
                .build();
    }


    @Override
    public List<ProjectResponse> getProjectsByTeam(Long teamId) {

        String email = SecurityUtil.getCurrentUserEmail();

        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RuntimeException("Team not found"));

        teamMemberRepository
                .findByTeamAndUser(team, loggedInUser)
                .orElseThrow(() ->
                        new RuntimeException(
                                "You are not a member of this team"
                        ));

        List<Project> projects =
                projectRepository.findByTeam(team);

        return projects.stream()
                .map(project ->
                        ProjectResponse.builder()
                                .id(project.getId())
                                .name(project.getName())
                                .description(project.getDescription())
                                .status(project.getStatus())
                                .createdBy(
                                        project.getCreatedBy().getName()
                                )
                                .createdAt(
                                        project.getCreatedAt()
                                )
                                .deadline(
                                        project.getDeadline()
                                )
                                .build()
                )
                .toList();
    }


    @Override
    public ProjectResponse updateProject(
            Long projectId,
            UpdateProjectRequest request) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        String email = SecurityUtil.getCurrentUserEmail();

        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Team team = project.getTeam();

        TeamMember currentMember = teamMemberRepository
                .findByTeamAndUser(team, loggedInUser)
                .orElseThrow(() ->
                        new RuntimeException(
                                "You are not a member of this team"
                        ));

        if (currentMember.getTeamRole() != TeamRole.OWNER &&
                currentMember.getTeamRole() != TeamRole.ADMIN) {

            throw new RuntimeException(
                    "Only OWNER or ADMIN can update projects"
            );
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());

        Project updatedProject =
                projectRepository.save(project);

        return ProjectResponse.builder()
                .id(updatedProject.getId())
                .name(updatedProject.getName())
                .description(updatedProject.getDescription())
                .status(updatedProject.getStatus())
                .createdBy(
                        updatedProject.getCreatedBy().getName()
                )
                .createdAt(
                        updatedProject.getCreatedAt()
                )
                .deadline(
                        updatedProject.getDeadline()
                )
                .build();
    }


    @Override
    public void deleteProject(Long projectId) {

        System.out.println(
                "========== DELETE PROJECT DEBUG =========="
        );

        System.out.println(
                "Deleting project ID: " + projectId
        );

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        String email = SecurityUtil.getCurrentUserEmail();

        System.out.println(
                "Current logged-in email: " + email
        );

        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        System.out.println(
                "Logged-in user ID: " + loggedInUser.getId()
        );

        System.out.println(
                "Logged-in user name: " + loggedInUser.getName()
        );

        Team team = project.getTeam();

        System.out.println(
                "Project team ID: " + team.getId()
        );

        System.out.println(
                "Project team name: " + team.getName()
        );

        TeamMember currentMember = teamMemberRepository
                .findByTeamAndUser(team, loggedInUser)
                .orElseThrow(() ->
                        new RuntimeException(
                                "You are not a member of this team"
                        ));

        if (currentMember.getTeamRole() != TeamRole.OWNER) {

            throw new RuntimeException(
                    "Only OWNER can delete projects"
            );
        }

        System.out.println(
                "Current user's TEAM ROLE: " +
                        currentMember.getTeamRole()
        );

        System.out.println("OWNER CHECK PASSED.");

        /*
         * IMPORTANT:
         *
         * Tasks have a foreign-key relationship with projects.
         * Therefore, tasks must be deleted BEFORE the project.
         */

        System.out.println(
                "Deleting tasks belonging to project..."
        );

        taskRepository.deleteByProject(project);

        System.out.println("Tasks deleted.");

        System.out.println("Deleting project...");

        projectRepository.delete(project);

        System.out.println(
                "PROJECT DELETED SUCCESSFULLY."
        );
    }
}