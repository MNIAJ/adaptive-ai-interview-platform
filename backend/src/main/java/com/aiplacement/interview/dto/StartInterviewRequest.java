package com.aiplacement.interview.dto;

import jakarta.validation.constraints.NotBlank;

public record StartInterviewRequest(
    @NotBlank String companyName,
    @NotBlank String interviewType // TECHNICAL, HR, BEHAVIORAL, CORE_CS, CODING
) {}
