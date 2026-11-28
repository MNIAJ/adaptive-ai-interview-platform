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
    private final ResumeRepository resumeRepository;
    private final AdaptiveInterviewEngine engine;
    private final ReportInsightService reportInsightService;
    private final PracticalService practicalService;

    @Transactional
    public InterviewQuestionResponse startInterview(String studentEmail, StartInterviewRequest request) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Company company = companyRepository.findByName(request.companyName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unknown company: " + request.companyName()));

        String type = request.interviewType().trim().toUpperCase(java.util.Locale.ROOT);
        if (type.equals("CAMPUS_SIMULATION")) type = "SIMULATION";
        try { InterviewSession.InterviewType.valueOf(type); } catch (IllegalArgumentException ex) { throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown interview mode"); }
        if (!Set.of("TECHNICAL","HR","SIMULATION").contains(type)) throw new ApiException(HttpStatus.BAD_REQUEST,"Choose technical, HR or campus simulation");
        int count = type.equals("SIMULATION") ? 15 : (request.totalQuestions()==null ? 0 : request.totalQuestions());
        if (!Set.of(5,10,15,20).contains(count)) throw new ApiException(HttpStatus.BAD_REQUEST,"Choose 5, 10, 15 or 20 questions");
        List<Question> bank = fetchBankForType(company.getId(), type);
        if (bank.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "No approved questions for " + company.getName() + " yet");
        }
        InterviewSession session = InterviewSession.builder().student(student).company(company)
                .type(InterviewSession.InterviewType.valueOf(type))
                .currentDifficulty(company.getName().equals("TCS Ninja") ? 2 : (company.getName().equals("TCS Prime") || company.getName().equals("AlgoQuant")) ? 4 : 3)
                .maxQuestions(count).build();
        sessionRepository.save(session);
        return issue(session, choose(session, bank, List.of()), null);
    }

    private List<Question> fetchBankForType(Long companyId, String type) {
        return questionRepository.findByCompanyIdAndApprovedTrueAndIsFollowUpFalseOrderById(companyId).stream()
            .filter(q -> q.getStage()!=null).filter(q -> switch(type) {
                case "HR", "BEHAVIORAL" -> q.getStage().equals("HR") || q.getStage().equals("MANAGERIAL");
                case "CODING" -> q.getStage().equals("TECHNICAL") && q.getTopic().equals("DSA");
                case "CORE_CS" -> q.getStage().equals("TECHNICAL") && Set.of("OS","DBMS","SQL","OOP","Networks","CS Fundamentals").contains(q.getTopic());
                case "TECHNICAL" -> q.getStage().equals("TECHNICAL");
                default -> true;
            }).toList();
    }
    private Question choose(InterviewSession s, List<Question> bank, List<Response> history) {
        int reserve=practicalCount(s);
        int theory=s.getMaxQuestions()-reserve;
        if(reserve>0 && history.size()>=theory){
            if(reserve==3 && history.size()==theory+2) return questionRepository.save(Question.builder().company(s.getCompany()).stage("PRACTICAL_REACT").topic("React Components").text("Implement function Greeting(props) using React.createElement (no JSX or imports). Return an h2 element containing Hello, NAME! using props.name. If name is empty or missing, use Guest. Example: name Ana gives Hello, Ana!.").rubric("Three component return-value tests using a React.createElement-compatible test double; no browser DOM evaluation.").baseDifficulty(2).origin("V6_REACT").approved(false).build());
            boolean sql=s.getType()!=InterviewSession.InterviewType.CODING && (reserve==1 ? s.getType()==InterviewSession.InterviewType.CORE_CS : history.size()>theory);
            return questionRepository.save(Question.builder().company(s.getCompany()).stage(sql?"PRACTICAL_SQL":"PRACTICAL_CODE").topic(sql?"SQL Practical":"DSA Coding").text(sql?"Write a SQL query returning only the name column for employees with salary at least 50000, sorted by name ascending. Table: employees(id INTEGER, name TEXT, salary INTEGER). Sample rows: (1,Ana,60000), (2,Bob,40000), (3,Dev,50000). Expected rows: Ana, Dev.":"Find the maximum element. Read integer n (1 <= n <= 1000), then n space-separated integers. Print only the maximum integer. Example input: 5 followed by 3 -2 9 1 4. Expected output: 9.").rubric("Score based on three server-side execution tests.").baseDifficulty(2).origin("V52_PRACTICAL").approved(false).build());
        }
        Set<Long> used=history.stream().map(r->r.getQuestion().getId()).collect(Collectors.toSet());
        List<Question> remaining=bank.stream().filter(q->!used.contains(q.getId()) && history.stream().noneMatch(r->r.getQuestion().getText().equals(q.getText()))).toList();
        if(remaining.isEmpty()) return null;
        String stage="TECHNICAL";
        if(s.getType()==InterviewSession.InterviewType.SIMULATION){
            int n=history.size(), max=theory;
            boolean tcsPanel=s.getCompany().getName().startsWith("TCS") && bank.stream().anyMatch(q->"MANAGERIAL".equals(q.getStage()));
            stage=n==0?"INTRO":n==1&&max>=5?"PROJECT":n>=max-2?"HR":tcsPanel&&max>=7&&n==max-3?"MANAGERIAL":"TECHNICAL";
        } else if(s.getType()==InterviewSession.InterviewType.HR || s.getType()==InterviewSession.InterviewType.BEHAVIORAL) stage="HR";
        final String target=stage;
        if ("PROJECT".equals(target)) {
            var resume = resumeRepository.findByStudentId(s.getStudent().getId());
            if (resume.isPresent() && resume.get().getSkillsCsv()!=null) {
                String skill = java.util.Arrays.stream(resume.get().getSkillsCsv().split(","))
                    .map(String::trim).filter(x->x.matches("[a-zA-Z0-9 +.#-]{1,40}")).findFirst().orElse("");
                if (!skill.isBlank()) {
                    String text = "Your resume lists " + skill + ". Describe a project or exercise where you used it, your contribution, and one technical decision you made. If you have not used it in a project, explain what you have learned so far.";
                    Question q = Question.builder().company(s.getCompany()).stage("PROJECT").topic("Projects").text(text).baseDifficulty(3).origin("V3_PERSONALIZED").approved(false).rubric("Concrete experience, ownership, technical decision and honest limitations.").build();
                    return questionRepository.save(q);
                }
            }
        }
        var candidates=new java.util.ArrayList<>(remaining.stream().filter(q->target.equals(q.getStage()) || (s.getType()==InterviewSession.InterviewType.HR && "MANAGERIAL".equals(q.getStage()))).toList());
        if(candidates.isEmpty()) candidates.addAll(remaining.stream().filter(q->!q.getStage().equals("INTRO")&&!q.getStage().equals("PROJECT")).toList());
        if(candidates.isEmpty()) candidates.addAll(remaining);
        Collections.shuffle(candidates);
        String skills = resumeRepository.findByStudentId(s.getStudent().getId()).map(Resume::getSkillsCsv).orElse("");
        Set<String> skillSet = new java.util.HashSet<>(java.util.Arrays.asList(skills.toLowerCase(java.util.Locale.ROOT).split(",")));
        return candidates.stream().min(java.util.Comparator.comparingInt((Question q)->Math.abs(q.getBaseDifficulty()-s.getCurrentDifficulty()))
            .thenComparingLong(q->history.stream().filter(r->r.getQuestion().getTopic().equals(q.getTopic())).count())
            .thenComparingInt(q->skillSet.contains(q.getTopic().toLowerCase(java.util.Locale.ROOT)) ? 0 : 1)).orElse(null);
    }
    private InterviewQuestionResponse issue(InterviewSession s, Question q, InterviewQuestionResponse previous){
        s.setCurrentQuestionId(q==null?null:q.getId());
        if(q==null){s.setStatus(InterviewSession.SessionStatus.COMPLETED);s.setEndedAt(Instant.now());}
        sessionRepository.save(s);
        return new InterviewQuestionResponse(s.getId(),q==null,previous==null||s.getType()==InterviewSession.InterviewType.SIMULATION?null:previous.lastScore(),previous==null||s.getType()==InterviewSession.InterviewType.SIMULATION?null:previous.lastFeedback(),previous==null?null:previous.wasFollowUp(),s.getCurrentDifficulty(),q==null?null:q.getId(),q==null?null:q.getText(),q==null?null:q.getTopic(),q==null?null:q.getStage(),q==null?null:q.getOrigin(),q==null?null:q.getSourceUrl());
    }
    @Transactional
    public InterviewQuestionResponse submitAnswer(String studentEmail, AnswerRequest request) {
        InterviewSession s=sessionRepository.lockById(request.sessionId()).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Session not found"));
        if(!s.getStudent().getEmail().equals(studentEmail)) throw new ApiException(HttpStatus.FORBIDDEN,"This session does not belong to you");
        if(s.getStatus()!=InterviewSession.SessionStatus.IN_PROGRESS || !java.util.Objects.equals(s.getCurrentQuestionId(),request.questionId())) throw new ApiException(HttpStatus.CONFLICT,"Question is not active");
        Question current=questionRepository.findById(request.questionId()).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Question not found"));
        var result=PracticalService.practical(current)&&!"[SKIPPED]".equals(request.answerText()) ? engine.recordEvaluation(s,current,request.answerText(),practicalService.grade(current,request.languageId()==null?0:request.languageId(),request.answerText())) : engine.submitAnswer(s,current,request.answerText());
        List<Response> history=responseRepository.findBySessionIdOrderByAnsweredAtAsc(s.getId());
        if(history.size()>=s.getMaxQuestions()) return issue(s,null,result);
        if(history.size()<s.getMaxQuestions()-practicalCount(s)-(s.getType()==InterviewSession.InterviewType.SIMULATION?3:0) && result.lastScore()<6 && !current.isFollowUp() && "TECHNICAL".equals(current.getStage()) && history.size()<s.getMaxQuestions()-(s.getType()==InterviewSession.InterviewType.SIMULATION && s.getCompany().getName().startsWith("TCS") ? 2 : 1) && history.stream().noneMatch(r->r.isWasFollowUp()&&r.getQuestion().getTopic().equals(current.getTopic()))){
            var follow=questionRepository.findByCompanyIdAndApprovedTrue(s.getCompany().getId()).stream().filter(q->q.getTopic().equals(current.getTopic())&&"TECHNICAL".equals(q.getStage())&&history.stream().noneMatch(r->r.getQuestion().getText().equals(q.getText()))).findFirst();
            if(follow.isPresent()) {
                Question base=follow.get();
                Question probe=Question.builder().company(s.getCompany()).stage(base.getStage()).topic(base.getTopic()).text(base.getText()).rubric(base.getRubric()).baseDifficulty(base.getBaseDifficulty()).isFollowUp(true).approved(false).origin("V3_PERSONALIZED").build();
                return issue(s,questionRepository.save(probe),result);
            }
        }
        return issue(s,choose(s,fetchBankForType(s.getCompany().getId(),s.getType().name()),history),result);
    }

    private int practicalCount(InterviewSession s){return switch(s.getType()){case TECHNICAL,SIMULATION -> s.getMaxQuestions()>=10?3:s.getMaxQuestions()>=4?2:s.getMaxQuestions()>=2?1:0;case CODING,CORE_CS -> s.getMaxQuestions()>=2?1:0;default -> 0;};}
    @Transactional
    public java.util.Map<String,Object> previewPractical(String email, AnswerRequest request){
      InterviewSession s=owned(email,request.sessionId());
      if(s.getStatus()!=InterviewSession.SessionStatus.IN_PROGRESS||!java.util.Objects.equals(s.getCurrentQuestionId(),request.questionId()))throw new ApiException(HttpStatus.CONFLICT,"Question is not active");
      Question q=questionRepository.findById(request.questionId()).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Question not found"));
      return practicalService.preview(q,request.languageId()==null?0:request.languageId(),request.answerText(),"5\n3 -2 9 1 4\n");
    }
    private InterviewSession owned(String email, Long id) {
        InterviewSession s=sessionRepository.lockById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Session not found"));
        if(!s.getStudent().getEmail().equals(email)) throw new ApiException(HttpStatus.FORBIDDEN,"This session does not belong to you");
        return s;
    }
    @Transactional
    public java.util.Map<String,Object> resumeSession(String email, Long id) {
        InterviewSession s=owned(email,id);
        var result=new java.util.LinkedHashMap<String,Object>();
        result.put("status",s.getStatus().name()); result.put("mode",s.getType().name());
        result.put("startedAt",s.getStartedAt()); result.put("maxQuestions",s.getMaxQuestions());
        result.put("questionNumber",responseRepository.findBySessionIdOrderByAnsweredAtAsc(id).size()+1);
        if(s.getStatus()==InterviewSession.SessionStatus.IN_PROGRESS && s.getCurrentQuestionId()!=null) {
            Question q=questionRepository.findById(s.getCurrentQuestionId()).orElseThrow(()->new ApiException(HttpStatus.CONFLICT,"Question unavailable"));
            result.put("question",new InterviewQuestionResponse(id,false,null,null,null,s.getCurrentDifficulty(),q.getId(),q.getText(),q.getTopic(),q.getStage(),q.getOrigin(),q.getSourceUrl()));
        }
        return result;
    }
    @Transactional
    public void endSession(String email, Long id) {
        InterviewSession s=owned(email,id);
        if(s.getStatus()==InterviewSession.SessionStatus.IN_PROGRESS) {
            s.setStatus(InterviewSession.SessionStatus.COMPLETED); s.setEndedAt(Instant.now()); s.setCurrentQuestionId(null);
            sessionRepository.save(s);
        }
    }
    @Transactional(readOnly = true)
    public ReportResponse generateReport(String studentEmail, Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
        if (!session.getStudent().getEmail().equals(studentEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This session does not belong to you");
        }

        List<Response> responses = responseRepository.findBySessionIdOrderByAnsweredAtAsc(sessionId);
        if(session.getStatus()==InterviewSession.SessionStatus.IN_PROGRESS) throw new ApiException(HttpStatus.CONFLICT,"Finish the interview before viewing its report");
        double avg = responses.stream().mapToInt(Response::getScore).average().orElse(0);
        int readiness = (int) (avg / 10.0 * 100);

        Set<String> weak = responses.stream().collect(Collectors.groupingBy(r->r.getQuestion().getTopic(),Collectors.averagingInt(Response::getScore))).entrySet().stream().filter(e->e.getValue()<6).map(java.util.Map.Entry::getKey).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        Set<String> strong = responses.stream().collect(Collectors.groupingBy(r->r.getQuestion().getTopic(),Collectors.averagingInt(Response::getScore))).entrySet().stream().filter(e->e.getValue()>=6).map(java.util.Map.Entry::getKey).collect(Collectors.toCollection(java.util.LinkedHashSet::new));

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
                insights.recommendation(),
                responses.stream().collect(Collectors.groupingBy(r -> r.getQuestion().getStage()==null?"LEGACY":r.getQuestion().getStage(), Collectors.averagingInt(Response::getScore))),
                responses.stream().collect(Collectors.groupingBy(r -> r.getQuestion().getTopic(), Collectors.averagingInt(Response::getScore))),
                responses.stream().map(r->new ReportResponse.AnswerDetail(r.getQuestion().getText(),r.getAnswerText(),r.getScore(),r.getAiFeedback(),r.getQuestion().getRubric())).toList(),
                session.getEndedAt()==null?0:Math.max(0,java.time.Duration.between(session.getStartedAt(),session.getEndedAt()).toSeconds())
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