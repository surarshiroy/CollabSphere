import api from "../api/axios";

// Get all projects belonging to a team
export const getProjectsByTeam = async (teamId) => {

    const response = await api.get(
        `/teams/${teamId}/projects`
    );

    return response.data;
};


// Create a new project
export const createProject = async (teamId, projectData) => {

    const response = await api.post(
        `/teams/${teamId}/projects`,
        projectData
    );

    return response.data;
};


// Update a project
export const updateProject = async (
    teamId,
    projectId,
    projectData
) => {

    const response = await api.put(
        `/teams/${teamId}/projects/${projectId}`,
        projectData
    );

    return response.data;
};


// Delete a project
export const deleteProject = async (
    teamId,
    projectId
) => {

    const response = await api.delete(
        `/teams/${teamId}/projects/${projectId}`
    );

    return response.data;
};