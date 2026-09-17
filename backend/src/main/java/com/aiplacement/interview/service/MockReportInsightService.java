package com.aiplacement.interview.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Heuristic fallback — no LLM call. Active when app.ai.provider=mock, or
 * when no provider is set at all, so the report endpoint never breaks on a
 * machine without Ollama configured. Mirrors the logic that used to live
 * as a hardcoded template in the frontend's Report.jsx.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockReportInsightService implements ReportInsightService {

    @Override
    public Insights generate(String companyName, double averageScore, int readinessPercent, List<QAResult> transcript) {
        List<String> weakTopics = transcript.stream()
                .filter(q -> q.score() < 6).map(QAResult::topic).distinct().toList();
        List<String> strongTopics = transcript.stream()
                .filter(q -> q.score() >= 6).map(QAResult::topic).distinct().toList();

        String recommendation;
        if (readinessPercent >= 70) {
            recommendation = "Strong performance. Focus on refining system design and edge cases for "
                    + companyName + "'s interview rounds.";
        } else if (readinessPercent >= 50) {
            recommendation = "Good foundation. Spend more time on "
                    + String.join(" and ", weakTopics.stream().limit(2).toList())
                    + " — these came up weak this session.";
        } else {
            recommendation = "Need more practice before " + companyName + ". Revisit fundamentals in "
                    + String.join(" and ", weakTopics.stream().limit(2).toList())
                    + " and attempt another session.";
        }

        return new Insights(
                strongTopics,
                weakTopics,
                List.of("Revisit fundamentals in your weaker topics", "Practice explaining answers with a concrete example"),
                recommendation
        );
    }
}
