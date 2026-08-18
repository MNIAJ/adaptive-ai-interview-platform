package com.aiplacement.interview.service;

import com.aiplacement.interview.dto.ResumeUploadResponse;
import com.aiplacement.interview.entity.Resume;
import com.aiplacement.interview.entity.User;
import com.aiplacement.interview.exception.ApiException;
import com.aiplacement.interview.repository.ResumeRepository;
import com.aiplacement.interview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    // Same keyword list as the sandbox demo — good enough for an MVP.
    // Upgrade path: replace this with an LLM call that extracts structured
    // {skills, projects, experience} as JSON, same pattern as OpenAIEvaluationService.
    private static final List<String> KNOWN_SKILLS = List.of(
        "java", "spring", "spring boot", "react", "sql", "postgresql", "docker",
        "python", "javascript", "git", "linux", "aws", "dsa", "system design",
        "hibernate", "jpa", "ansible", "zabbix", "grafana"
    );

    @Transactional
    public ResumeUploadResponse uploadAndParse(String studentEmail, MultipartFile pdfFile) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        String text;
        try (var doc = Loader.loadPDF(pdfFile.getBytes())) {
            text = new PDFTextStripper().getText(doc);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read PDF — is the file valid?");
        }

        String lower = text.toLowerCase();
        List<String> foundSkills = new ArrayList<>();
        for (String skill : KNOWN_SKILLS) {
            if (lower.contains(skill)) foundSkills.add(skill);
        }

        List<String> projectLines = new ArrayList<>();
        for (String line : text.split("\n")) {
            if (line.toLowerCase().contains("project")) projectLines.add(line.trim());
        }
        String projectsSummary = String.join(" | ", projectLines);

        Resume resume = resumeRepository.findByStudentId(student.getId())
                .orElse(Resume.builder().student(student).build());
        resume.setExtractedText(text.length() > 20000 ? text.substring(0, 20000) : text);
        resume.setSkillsCsv(String.join(",", foundSkills));
        resume.setProjectsSummary(projectsSummary.length() > 2000 ? projectsSummary.substring(0, 2000) : projectsSummary);
        resumeRepository.save(resume);

        return new ResumeUploadResponse(foundSkills, projectsSummary);
    }
}
