import api from "../api/axios";


// Create a new team
export const createTeam = async (teamData) => {

    const response = await api.post("/teams", teamData);

    return response.data;

};


// Get teams belonging to the logged-in user
export const getMyTeams = async () => {

    const response = await api.get("/teams");

    return response.data;

};
// Delete a team
export const deleteTeam = async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);

    return response.data;
};

// Add a member to a team
export const addMember = async (teamId, memberData) => {
    const response = await api.post(
        `/teams/${teamId}/members`,
        memberData
    );

    return response.data;
};

export const getTeamMembers = async (teamId) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
};

// Remove a member from a team
export const removeMember = async (
    teamId,
    memberId
) => {

    const response = await api.delete(
        `/teams/${teamId}/members/${memberId}`
    );

    return response.data;
};

// Update team
export const updateTeam = async (
    teamId,
    teamData
) => {

    const response = await api.put(
        `/teams/${teamId}`,
        teamData
    );

    return response.data;
};