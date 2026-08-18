package com.aiplacement.interview.ai;

// The whole point of this interface: AdaptiveInterviewEngine depends on THIS,
// never on a concrete provider. Swap MockAIEvaluationService for
// OpenAIEvaluationService (or a GeminiEvaluationService you add later) purely
// via application.yml — zero changes to the engine or controllers.
public interface AIEvaluationService {
    EvaluationResult evaluate(String questionText, String topic, String answerText);

    record EvaluationResult(int score, String feedback) {
        public boolean isWeak() {
            return score < 6;
        }
    }
}
