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
    String nextQuestionTopic, String stage, String origin, String sourceUrl
) {
 public InterviewQuestionResponse(Long sid, boolean done, Integer score, String feedback, Boolean follow, Integer difficulty, Long qid, String text, String topic) {
  this(sid,done,score,feedback,follow,difficulty,qid,text,topic,null,null,null);
 }
}
