package com.aiplacement.interview.service;

import com.aiplacement.interview.dto.*;
import com.aiplacement.interview.engine.AdaptiveInterviewEngine;
import com.aiplacement.interview.entity.*;
import com.aiplacement.interview.exception.ApiException;
import com.aiplacement.interview.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final CompanyRepository companyRepository;
    private final QuestionRepository questionRepository;
    private final ResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final AdaptiveInterviewEngine engine;

    @Transactional
    public InterviewQuestionResponse startInterview(String studentEmail, StartInterviewRequest request) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Company company = companyRepository.findByName(request.companyName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unknown company: " + request.companyName()));

        List<Question> bank = questionRepository.findByCompanyIdAndApprovedTrueAndIsFollowUpFalseOrderById(company.getId());
        if (bank.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "No approved questions for " + company.getName() + " yet");
        }

        InterviewSession session = InterviewSession.builder()
                .student(student)
                .company(company)
                .type(InterviewSession.InterviewType.valueOf(request.interviewType()))
                .build();
        sessionRepository.save(session);

        Question first = bank.get(0);
        return new InterviewQuestionResponse(session.getId(), false, null, null, null,
                session.getCurrentDifficulty(), first.getId(), first.getText(), first.getTopic());
    }

    @Transactional
    public InterviewQuestionResponse submitAnswer(String studentEmail, AnswerRequest request) {
        InterviewSession session = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!session.getStudent().getEmail().equals(studentEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This session does not belong to you");
        }
        Question currentQuestion = questionRepository.findById(request.questionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));

        InterviewQuestionResponse engineResult = engine.submitAnswer(session, currentQuestion, request.answerText());

        // If the engine already found a same-topic follow-up, use it as-is.
        if (engineResult.nextQuestionId() != null) {
            return engineResult;
        }

        // Otherwise: pick the next not-yet-asked BASE question for this company.
        Set<Long> askedQuestionIds = responseRepository.findBySessionIdOrderByAnsweredAtAsc(session.getId())
                .stream().map(r -> r.getQuestion().getId()).collect(Collectors.toSet());

        List<Question> bank = questionRepository.findByCompanyIdAndApprovedTrueAndIsFollowUpFalseOrderById(session.getCompany().getId());
        var nextBase = bank.stream().filter(q -> !askedQuestionIds.contains(q.getId())).findFirst();

        if (nextBase.isEmpty()) {
            session.setStatus(InterviewSession.SessionStatus.COMPLETED);
            session.setEndedAt(Instant.now());
            sessionRepository.save(session);
            return new InterviewQuestionResponse(session.getId(), true,
                    engineResult.lastScore(), engineResult.lastFeedback(), engineResult.wasFollowUp(),
                    engineResult.currentDifficulty(), null, null, null);
        }

        Question next = nextBase.get();
        return new InterviewQuestionResponse(session.getId(), false,
                engineResult.lastScore(), engineResult.lastFeedback(), engineResult.wasFollowUp(),
                engineResult.currentDifficulty(), next.getId(), next.getText(), next.getTopic());
    }

    @Transactional(readOnly = true)
    public ReportResponse generateReport(String studentEmail, Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
        if (!session.getStudent().getEmail().equals(studentEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This session does not belong to you");
        }

        List<Response> responses = responseRepository.findBySessionIdOrderByAnsweredAtAsc(sessionId);
        double avg = responses.stream().mapToInt(Response::getScore).average().orElse(0);

        Set<String> weak = responses.stream().filter(r -> r.getScore() < 6)
                .map(r -> r.getQuestion().getTopic()).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        Set<String> strong = responses.stream().filter(r -> r.getScore() >= 6)
                .map(r -> r.getQuestion().getTopic()).collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        return new ReportResponse(
                session.getId(),
                session.getCompany().getName(),
                responses.size(),
                Math.round(avg * 10) / 10.0,
                (int) (avg / 10.0 * 100),
                weak.stream().toList(),
                strong.stream().toList()
        );
    }
}
