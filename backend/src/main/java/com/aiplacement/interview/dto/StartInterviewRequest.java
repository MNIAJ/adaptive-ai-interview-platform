package com.aiplacement.interview.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record StartInterviewRequest(
    @NotBlank String companyName,
    @NotBlank String interviewType, // TECHNICAL, HR, BEHAVIORAL, CORE_CS, CODING
    @Min(3) @Max(20) int totalQuestions
) {}
