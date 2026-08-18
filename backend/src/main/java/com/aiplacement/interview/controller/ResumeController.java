package com.aiplacement.interview.controller;

import com.aiplacement.interview.dto.ResumeUploadResponse;
import com.aiplacement.interview.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResumeUploadResponse upload(@RequestParam("file") MultipartFile file) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return resumeService.uploadAndParse(email, file);
    }
}
