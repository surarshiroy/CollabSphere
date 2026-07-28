package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.AddCommentRequest;
import com.collabsphere.collabsphere.dto.CommentResponse;
import com.collabsphere.collabsphere.dto.UpdateCommentRequest;
import com.collabsphere.collabsphere.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tasks/{taskId}/comments")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public CommentResponse addComment(
            @PathVariable Long taskId,
            @RequestBody AddCommentRequest request) {

        return commentService.addComment(taskId, request);
    }

    @GetMapping
    public List<CommentResponse> getComments(
            @PathVariable Long taskId) {

        return commentService.getComments(taskId);
    }

    @PutMapping("/{commentId}")
    public CommentResponse updateComment(
            @PathVariable Long commentId,
            @RequestBody UpdateCommentRequest request) {

        return commentService.updateComment(commentId, request);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId) {

        commentService.deleteComment(commentId);

        return ResponseEntity.noContent().build();
    }
}