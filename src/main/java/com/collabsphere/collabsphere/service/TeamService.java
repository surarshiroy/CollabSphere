package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.*;

import java.util.List;

public interface TeamService {

    void createTeam(CreateTeamRequest request);

    List<TeamResponse> getMyTeams();

    void addMember(Long teamId, AddMemberRequest request);

    List<MemberResponse> getTeamMembers(Long teamId);

    void deleteTeam(Long teamId);

    TeamResponse updateTeam(
            Long teamId,
            UpdateTeamRequest request
    );
    void removeMember(
            Long teamId,
            Long memberId
    );
}