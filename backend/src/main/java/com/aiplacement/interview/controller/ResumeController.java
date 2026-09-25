package com.aiplacement.interview.controller;

import com.aiplacement.interview.dto.ResumeUploadResponse;
import com.aiplacement.interview.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    private String currentEmail() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResumeUploadResponse upload(@RequestParam("file") MultipartFile file) {
        return resumeService.uploadAndParse(currentEmail(), file);
    }

    // NEW — 200 with the resume if one exists, 204 (no body) if the student
    // hasn't uploaded one yet. The frontend calls this on Dashboard mount.
    @GetMapping("/me")
    public ResponseEntity<ResumeUploadResponse> mine() {
        return resumeService.getMine(currentEmail())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
