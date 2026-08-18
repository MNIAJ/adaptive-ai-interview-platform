package com.aiplacement.interview.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Amazon", "TCS Digital"

    // Free-text description of interview pattern/focus areas — kept simple
    // for the MVP. Could be normalized into its own table later if you need
    // to query/filter on individual focus areas.
    @Column(length = 1000)
    private String focusAreas;

    private String difficultyProfile; // e.g. "HIGH", "MEDIUM"
}
