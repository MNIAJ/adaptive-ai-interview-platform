package com.aiplacement.interview.dto;

import java.time.Instant;

// One row in the "past interviews" history list. averageScore/readinessPercent
// are null for a session that's still IN_PROGRESS or has zero answered
// questions yet (e.g. abandoned right after starting) — the frontend should
// show a "resume" or "in progress" state for those instead of a score.
public record SessionSummaryResponse(
        Long sessionId,
        String company,
        String interviewType,
        String status,
        Instant startedAt,
        Instant endedAt,
        int questionsAnswered,
        Double averageScore,
        Integer readinessPercent
) {}
