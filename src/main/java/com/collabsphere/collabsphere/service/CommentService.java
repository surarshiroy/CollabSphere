package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.*;

import java.util.List;

public interface CommentService {

    CommentResponse addComment(Long taskId, AddCommentRequest request);

    List<CommentResponse> getComments(Long taskId);

    CommentResponse updateComment(Long commentId,
                                  UpdateCommentRequest request);

    void deleteComment(Long commentId);

}