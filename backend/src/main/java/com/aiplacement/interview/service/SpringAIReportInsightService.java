package com.aiplacement.interview.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Real per-session analysis via the same local Ollama model used for
 * per-answer grading. One extra call at the END of a session (not per
 * answer), so it's cheap even on a small model.
 *
 * Temperature comes from application.yml (spring.ai.ollama.chat.options.temperature),
 * not set here — see SpringAIEvaluationService for why.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "springai")
public class SpringAIReportInsightService implements ReportInsightService {

    private final ChatClient chatClient;
    private final MockReportInsightService fallback = new MockReportInsightService();

    public SpringAIReportInsightService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    private static final Pattern STRENGTHS = Pattern.compile("STRENGTHS:\\s*(.+)");
    private static final Pattern WEAKNESSES = Pattern.compile("WEAKNESSES:\\s*(.+)");
    private static final Pattern STUDY_PLAN = Pattern.compile("STUDY_PLAN:\\s*(.+)");
    private static final Pattern RECOMMENDATION = Pattern.compile("RECOMMENDATION:\\s*(.+)", Pattern.DOTALL);

    @Override
    public Insights generate(String companyName, double averageScore, int readinessPercent, List<QAResult> transcript) {
        try {
            String qaLines = transcript.stream()
                    .map(q -> String.format("- [%s]%s Q: %s -> Score: %d/10",
                            q.topic(), q.wasFollowUp() ? " (follow-up)" : "",
                            truncate(q.questionText(), 120), q.score()))
                    .collect(Collectors.joining("\n"));

            String prompt = """
                You are a technical interview coach writing a short performance
                report for a student right after a mock interview. Base
                everything ONLY on the results below — do not invent topics
                that weren't asked about.

                Company: %s
                Overall average score: %.1f/10
                Readiness: %d%%

                Question-by-question results:
                %s

                Write exactly four lines in this format, nothing else:
                STRENGTHS: <2-3 short phrases, separated by | , naming specific topics that scored well>
                WEAKNESSES: <2-3 short phrases, separated by | , naming specific topics that scored poorly>
                STUDY_PLAN: <3-4 concrete, actionable study steps, separated by | >
                RECOMMENDATION: <2-3 direct, honest, encouraging sentences mentioning specific topics by name>
                """.formatted(companyName, averageScore, readinessPercent, qaLines);

            String content = chatClient.prompt().user(prompt).call().content();

            List<String> strengths = extractPipeList(STRENGTHS, content);
            List<String> weaknesses = extractPipeList(WEAKNESSES, content);
            List<String> studyPlan = extractPipeList(STUDY_PLAN, content);
            Matcher recMatcher = RECOMMENDATION.matcher(content);
            String recommendation = recMatcher.find() ? recMatcher.group(1).trim() : null;

            if (strengths.isEmpty() && weaknesses.isEmpty() && recommendation == null) {
                return fallback.generate(companyName, averageScore, readinessPercent, transcript);
            }

            return new Insights(
                    strengths,
                    weaknesses,
                    studyPlan,
                    recommendation != null ? recommendation
                            : fallback.generate(companyName, averageScore, readinessPercent, transcript).recommendation()
            );
        } catch (Exception e) {
            return fallback.generate(companyName, averageScore, readinessPercent, transcript);
        }
    }

    private List<String> extractPipeList(Pattern pattern, String content) {
        Matcher m = pattern.matcher(content);
        if (!m.find()) return List.of();
        return java.util.Arrays.stream(m.group(1).split("\\|"))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}