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
import java.util.Collections;
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
    private final ReportInsightService reportInsightService;

    @Transactional
    public InterviewQuestionResponse startInterview(String studentEmail, StartInterviewRequest request) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Company company = companyRepository.findByName(request.companyName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unknown company: " + request.companyName()));

        List<Question> bank = fetchBankForType(company.getId(), request.interviewType());
        if (bank.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "No approved questions for " + company.getName() + " yet");
        }
        Collections.shuffle(bank);

        InterviewSession session = InterviewSession.builder()
                .student(student)
                .company(company)
                .type(InterviewSession.InterviewType.valueOf(request.interviewType()))
                .maxQuestions(request.totalQuestions())
                .build();
        sessionRepository.save(session);

        Question first = bank.get(0);
        return new InterviewQuestionResponse(session.getId(), false, null, null, null,
                session.getCurrentDifficulty(), first.getId(), first.getText(), first.getTopic());
    }

    private List<Question> fetchBankForType(Long companyId, String interviewType) {
        return switch (interviewType) {
            case "TECHNICAL", "CODING" -> questionRepository.findByCompanyIdAndApprovedTrueAndIsFollowUpFalseAndTopicIn(
                    companyId, List.of("DSA", "DSA_CODING", "SQL", "System Design", "OOP", "CS Fundamentals", "DBMS"));
            case "HR", "BEHAVIORAL" -> questionRepository.findByCompanyIdAndApprovedTrueAndIsFollowUpFalseAndTopicIn(
                    companyId, List.of("Communication", "Leadership Principles", "Aptitude Reasoning", "Problem Solving"));
            default -> questionRepository.findByCompanyIdAndApprovedTrueAndIsFollowUpFalseOrderById(companyId);
        };
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

        if (engineResult.nextQuestionId() != null) {
            return engineResult;
        }

        Set<Long> askedQuestionIds = responseRepository.findBySessionIdOrderByAnsweredAtAsc(session.getId())
                .stream().map(r -> r.getQuestion().getId()).collect(Collectors.toSet());

        List<Question> bank = fetchBankForType(session.getCompany().getId(), session.getType().name());
        var nextBase = bank.stream().filter(q -> !askedQuestionIds.contains(q.getId())).findFirst();

        boolean reachedLimit = askedQuestionIds.size() >= session.getMaxQuestions();

        if (nextBase.isEmpty() || reachedLimit) {
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
        int readiness = (int) (avg / 10.0 * 100);

        Set<String> weak = responses.stream().filter(r -> r.getScore() < 6)
                .map(r -> r.getQuestion().getTopic()).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        Set<String> strong = responses.stream().filter(r -> r.getScore() >= 6)
                .map(r -> r.getQuestion().getTopic()).collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        List<ReportInsightService.QAResult> transcript = responses.stream()
                .map(r -> new ReportInsightService.QAResult(
                        r.getQuestion().getTopic(), r.getQuestion().getText(), r.getScore(), r.isWasFollowUp()))
                .toList();
        ReportInsightService.Insights insights = reportInsightService.generate(
                session.getCompany().getName(), avg, readiness, transcript);

        return new ReportResponse(
                session.getId(),
                session.getCompany().getName(),
                responses.size(),
                Math.round(avg * 10) / 10.0,
                readiness,
                weak.stream().toList(),
                strong.stream().toList(),
                insights.strengths(),
                insights.weaknesses(),
                insights.studyPlan(),
                insights.recommendation()
        );
    }

    @Transactional(readOnly = true)
    public List<SessionSummaryResponse> getHistory(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        return sessionRepository.findByStudentIdOrderByStartedAtDesc(student.getId()).stream()
                .map(session -> {
                    List<Response> responses = session.getResponses();
                    Double avg = responses.isEmpty() ? null
                            : responses.stream().mapToInt(Response::getScore).average().orElse(0);
                    Integer readiness = avg == null ? null : (int) (avg / 10.0 * 100);
                    return new SessionSummaryResponse(
                            session.getId(),
                            session.getCompany().getName(),
                            session.getType().name(),
                            session.getStatus().name(),
                            session.getStartedAt(),
                            session.getEndedAt(),
                            responses.size(),
                            avg == null ? null : Math.round(avg * 10) / 10.0,
                            readiness
                    );
                })
                .toList();
    }
}