package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.AddMemberRequest;
import com.collabsphere.collabsphere.dto.CreateTeamRequest;
import com.collabsphere.collabsphere.dto.TeamResponse;

import java.util.List;

public interface TeamService {

    void createTeam(CreateTeamRequest request);

    List<TeamResponse> getMyTeams();

    void addMember(Long teamId, AddMemberRequest request);

}