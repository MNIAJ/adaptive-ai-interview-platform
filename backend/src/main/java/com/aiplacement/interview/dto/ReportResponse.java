package com.aiplacement.interview.dto;

import java.util.List;

public record ReportResponse(
    Long sessionId,
    String company,
    int questionsAsked,
    double averageScore,
    int readinessPercent,
    List<String> weakTopics,
    List<String> strongTopics,
    // New: real per-session analysis, generated from the actual Q&A transcript
    // instead of a hardcoded template keyed off a readiness bucket.
    List<String> keyStrengths,
    List<String> keyWeaknesses,
    List<String> studyPlan,
    String recommendation, java.util.Map<String, Double> stageScores, java.util.Map<String, Double> topicScores, List<AnswerDetail> answers, long durationSeconds
) { public record AnswerDetail(String question,String answer,int score,String feedback,String rubric) {} }
