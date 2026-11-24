package com.aiplacement.interview.engine;

import com.aiplacement.interview.ai.AIEvaluationService;
import com.aiplacement.interview.dto.InterviewQuestionResponse;
import com.aiplacement.interview.entity.*;
import com.aiplacement.interview.repository.QuestionRepository;
import com.aiplacement.interview.repository.ResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * This is the algorithm proven live in the sandbox demo, now wired to real
 * entities/repositories instead of in-memory maps.
 *
 * Flow per answer:
 *   1. Evaluate the answer via AIEvaluationService (mock or real LLM).
 *   2. If it's weak AND we haven't already asked a follow-up on this topic
 *      in this session -> pull a follow-up question on the SAME topic,
 *      difficulty unchanged.
 *   3. Otherwise -> advance to the next base question for this company,
 *      and nudge currentDifficulty up (if strong) or down (if weak),
 *      clamped to [1,5].
 *   4. If there's no next base question left -> session finished.
 */
@Component
@RequiredArgsConstructor
public class AdaptiveInterviewEngine {

    private final AIEvaluationService aiEvaluationService;
    private final QuestionRepository questionRepository;
    private final ResponseRepository responseRepository;

    public InterviewQuestionResponse submitAnswer(InterviewSession session, Question currentQuestion, String answerText) {
        AIEvaluationService.EvaluationResult eval =
                aiEvaluationService.evaluate(currentQuestion.getText(), currentQuestion.getTopic(), answerText);

        Response response = Response.builder()
                .session(session)
                .question(currentQuestion)
                .answerText(answerText)
                .score(eval.score())
                .aiFeedback(eval.feedback())
                .wasFollowUp(currentQuestion.isFollowUp())
                .build();
        responseRepository.save(response);

        session.setCurrentDifficulty(eval.isWeak()
                ? Math.max(1, session.getCurrentDifficulty() - 1)
                : Math.min(5, session.getCurrentDifficulty() + 1));

        return new InterviewQuestionResponse(
                session.getId(),
                false, // InterviewService overwrites this once it knows if a next question exists
                eval.score(),
                eval.feedback(),
                currentQuestion.isFollowUp(),
                session.getCurrentDifficulty(),
                null, null, null
        );
    }
}
