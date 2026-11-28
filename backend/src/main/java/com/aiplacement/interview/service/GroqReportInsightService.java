package com.aiplacement.interview.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/** Score-based report insights for cloud mode; no extra API quota required. */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "groq")
public class GroqReportInsightService implements ReportInsightService {
    private final MockReportInsightService delegate = new MockReportInsightService();

    @Override
    public Insights generate(String companyName, double averageScore, int readinessPercent,
                             java.util.List<QAResult> transcript) {
        return delegate.generate(companyName, averageScore, readinessPercent, transcript);
    }
}
