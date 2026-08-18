package com.aiplacement.interview.repository;

import com.aiplacement.interview.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCompanyIdAndApprovedTrueAndIsFollowUpFalse(Long companyId);
    List<Question> findByTopicAndApprovedTrueAndIsFollowUpTrue(String topic);
}
