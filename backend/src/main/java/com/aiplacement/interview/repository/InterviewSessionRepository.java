package com.aiplacement.interview.repository;

import com.aiplacement.interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByStudentIdOrderByStartedAtDesc(Long studentId);
}
