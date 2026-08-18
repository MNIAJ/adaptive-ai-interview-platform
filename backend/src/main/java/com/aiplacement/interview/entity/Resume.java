package com.aiplacement.interview.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "resumes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User student;

    @Column(length = 20000)
    private String extractedText; // raw text pulled from the PDF via PDFBox

    @Column(length = 2000)
    private String skillsCsv; // comma-separated, kept simple for MVP

    @Column(length = 2000)
    private String projectsSummary;

    private Instant uploadedAt;

    @PrePersist
    void onCreate() {
        this.uploadedAt = Instant.now();
    }
}
