package com.aiplacement.interview.repository;

import com.aiplacement.interview.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findByStudentId(Long studentId);
}
