package com.aiplacement.interview.dto;

// What the frontend needs to render the next question and, after an answer,
// the feedback on the one just asked.
public record InterviewQuestionResponse(
    Long sessionId,
    boolean finished,
    Integer lastScore,
    String lastFeedback,
    Boolean wasFollowUp,
    Integer currentDifficulty,
    Long nextQuestionId,
    String nextQuestionText,
    String nextQuestionTopic
) {}
