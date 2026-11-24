package com.aiplacement.interview.repository;

import com.aiplacement.interview.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @org.springframework.data.jpa.repository.Query("select q from Question q where q.company.id = :companyId and q.approved = true and q.isFollowUp = false order by q.id")
    List<Question> findByCompanyIdAndApprovedTrueAndIsFollowUpFalseOrderById(@org.springframework.data.repository.query.Param("companyId") Long companyId);
    java.util.Optional<Question> findFirstByCompanyIdAndText(Long companyId, String text);
    List<Question> findByCompanyIdAndApprovedTrue(Long companyId);
    boolean existsByCompanyIdAndText(Long companyId, String text);
}
