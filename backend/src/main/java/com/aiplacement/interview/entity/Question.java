package com.aiplacement.interview.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company; // null = generic, usable across companies

    @Column(nullable = false, length = 2000)
    private String text;

    @Column(nullable = false)
    private String topic; // e.g. "DSA", "System Design", "Leadership Principles"

    @Column(nullable = false)
    private int baseDifficulty; // 1-5

    // A question can itself be a follow-up variant for a topic. Kept as a
    // boolean flag rather than a separate table — simplest thing that works.
    private boolean isFollowUp;

    private boolean approved; // Faculty must approve before it enters rotation
}
