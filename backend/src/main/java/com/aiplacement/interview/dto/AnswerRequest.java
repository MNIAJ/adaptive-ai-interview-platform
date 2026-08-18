package com.aiplacement.interview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AnswerRequest(
    @NotNull Long sessionId,
    @NotNull Long questionId,
    @NotBlank String answerText
) {}
