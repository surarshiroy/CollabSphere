package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.AddMemberRequest;
import com.collabsphere.collabsphere.dto.CreateTeamRequest;
import com.collabsphere.collabsphere.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.collabsphere.collabsphere.dto.TeamResponse;

import java.util.List;
import com.collabsphere.collabsphere.dto.MemberResponse;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<String> createTeam(@RequestBody CreateTeamRequest request) {

        teamService.createTeam(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Team created successfully");
    }
    @GetMapping
    public ResponseEntity<List<TeamResponse>> getMyTeams() {

        return ResponseEntity.ok(teamService.getMyTeams());

    }
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<MemberResponse>> getTeamMembers(
            @PathVariable Long teamId) {

        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }
    @PostMapping("/{teamId}/members")
    public ResponseEntity<String> addMember(
            @PathVariable Long teamId,
            @RequestBody AddMemberRequest request) {

        teamService.addMember(teamId, request);

        return ResponseEntity.ok("Member added successfully");
    }
    // DELETE TEAM
    @DeleteMapping("/{teamId}")
    public ResponseEntity<String> deleteTeam(
            @PathVariable Long teamId) {

        teamService.deleteTeam(teamId);

        return ResponseEntity.ok("Team deleted successfully");
    }
}