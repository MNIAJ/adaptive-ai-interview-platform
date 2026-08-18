package com.aiplacement.interview.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "responses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id")
    private InterviewSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(length = 4000)
    private String answerText;

    private int score; // 1-10, from AIEvaluationService

    @Column(length = 2000)
    private String aiFeedback;

    private boolean wasFollowUp; // true if this question was generated as a follow-up

    private Instant answeredAt;

    @PrePersist
    void onCreate() {
        this.answeredAt = Instant.now();
    }
}
