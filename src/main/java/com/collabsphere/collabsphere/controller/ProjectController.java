package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.CreateProjectRequest;
import com.collabsphere.collabsphere.dto.ProjectResponse;
import com.collabsphere.collabsphere.dto.UpdateProjectRequest;
import com.collabsphere.collabsphere.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ProjectResponse createProject(
            @PathVariable Long teamId,
            @RequestBody CreateProjectRequest request) {


        return projectService.createProject(teamId, request);
    }

    @GetMapping
    public List<ProjectResponse> getProjectsByTeam(@PathVariable Long teamId) {
        return projectService.getProjectsByTeam(teamId);
    }
    @PutMapping("/{projectId}")
    public ProjectResponse updateProject(
            @PathVariable Long teamId,
            @PathVariable Long projectId,
            @RequestBody UpdateProjectRequest request) {

        return projectService.updateProject(projectId, request);
    }
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long teamId,
            @PathVariable Long projectId) {

        projectService.deleteProject(projectId);

        return ResponseEntity.noContent().build();
    }

}