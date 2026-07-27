package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.CreateProjectRequest;
import com.collabsphere.collabsphere.dto.ProjectResponse;
import com.collabsphere.collabsphere.dto.UpdateProjectRequest;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(Long teamId, CreateProjectRequest request);


    List<ProjectResponse> getProjectsByTeam(Long teamId);

    ProjectResponse updateProject(Long projectId, UpdateProjectRequest request);

    void deleteProject(Long projectId);

}