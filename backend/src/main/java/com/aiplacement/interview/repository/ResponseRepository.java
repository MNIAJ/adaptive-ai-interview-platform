package com.aiplacement.interview.repository;

import com.aiplacement.interview.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findBySessionIdOrderByAnsweredAtAsc(Long sessionId);
}
