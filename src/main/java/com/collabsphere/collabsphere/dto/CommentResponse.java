package com.collabsphere.collabsphere.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long id;

    private String content;

    private Long authorId;

    private String author;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}