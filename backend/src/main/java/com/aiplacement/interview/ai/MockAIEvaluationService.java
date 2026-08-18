package com.aiplacement.interview.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

// Active by default (app.ai.provider=mock in application.yml) so you can run
// and demo the whole platform with zero API keys. This is the exact same
// heuristic proven working in the live sandbox demo — swap to
// OpenAIEvaluationService once you have a key and want real evaluation.
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAIEvaluationService implements AIEvaluationService {

    @Override
    public EvaluationResult evaluate(String questionText, String topic, String answerText) {
        String trimmed = answerText == null ? "" : answerText.trim();
        int wordCount = trimmed.isEmpty() ? 0 : trimmed.split("\\s+").length;

        if (wordCount < 8) {
            return new EvaluationResult(2, "Answer is too brief — no concrete detail or example given.");
        } else if (wordCount < 25) {
            return new EvaluationResult(5, "On the right track, but lacks depth or a concrete example.");
        } else {
            return new EvaluationResult(8, "Clear, detailed answer with good structure.");
        }
    }
}
