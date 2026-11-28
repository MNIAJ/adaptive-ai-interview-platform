package com.aiplacement.interview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AnswerRequest(
    @NotNull Long sessionId,
    @NotNull Long questionId,
    @NotBlank @jakarta.validation.constraints.Size(max=4000) String answerText, Integer languageId
) {}
