package com.aiplacement.interview.controller;

import com.aiplacement.interview.dto.*;
import com.aiplacement.interview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    // JwtAuthFilter puts the authenticated user's email as the principal
    // (see JwtAuthFilter.java) — this is how every protected endpoint knows
    // "who is calling", without ever trusting a client-supplied user id.
    private String currentEmail() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/start")
    public InterviewQuestionResponse start(@Valid @RequestBody StartInterviewRequest request) {
        return interviewService.startInterview(currentEmail(), request);
    }

    @PostMapping("/answer")
    public InterviewQuestionResponse answer(@Valid @RequestBody AnswerRequest request) {
        return interviewService.submitAnswer(currentEmail(), request);
    }

    @GetMapping("/report/{sessionId}")
    public ReportResponse report(@PathVariable Long sessionId) {
        return interviewService.generateReport(currentEmail(), sessionId);
    }
}
