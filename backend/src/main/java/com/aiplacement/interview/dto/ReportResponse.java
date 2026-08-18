package com.aiplacement.interview.dto;

import java.util.List;

public record ReportResponse(
    Long sessionId,
    String company,
    int questionsAsked,
    double averageScore,
    int readinessPercent,
    List<String> weakTopics,
    List<String> strongTopics
) {}
