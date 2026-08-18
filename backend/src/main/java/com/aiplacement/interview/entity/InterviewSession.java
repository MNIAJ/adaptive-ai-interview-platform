package com.aiplacement.interview.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    private InterviewType type; // TECHNICAL, HR, BEHAVIORAL, CORE_CS, CODING

    @Builder.Default
    private int currentDifficulty = 3;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Response> responses = new ArrayList<>();

    private Instant startedAt;
    private Instant endedAt;

    @PrePersist
    void onCreate() {
        this.startedAt = Instant.now();
    }

    public enum InterviewType { TECHNICAL, HR, BEHAVIORAL, CORE_CS, CODING }
    public enum SessionStatus { IN_PROGRESS, COMPLETED, ABANDONED }
}
