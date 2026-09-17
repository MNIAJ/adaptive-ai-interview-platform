package com.aiplacement.interview.service;

import java.util.List;

/**
 * Generates the qualitative part of the report: strengths, weaknesses, a
 * study plan, and a written recommendation — as opposed to the numeric part
 * (average score, readiness %, topic lists) which InterviewService already
 * computes directly from Response rows.
 *
 * Two implementations, picked by app.ai.provider same as AIEvaluationService:
 *  - MockReportInsightService: heuristic, no LLM call, used when provider=mock
 *    (so the app never breaks if someone runs it without Ollama configured).
 *  - SpringAIReportInsightService: real analysis from the local model.
 */
public interface ReportInsightService {

    record Insights(
        List<String> strengths,
        List<String> weaknesses,
        List<String> studyPlan,
        String recommendation
    ) {}

    record QAResult(String topic, String questionText, int score, boolean wasFollowUp) {}

    Insights generate(String companyName, double averageScore, int readinessPercent, List<QAResult> transcript);
}
