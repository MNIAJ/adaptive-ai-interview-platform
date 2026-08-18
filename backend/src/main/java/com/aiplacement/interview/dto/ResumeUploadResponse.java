package com.aiplacement.interview.dto;

import java.util.List;

public record ResumeUploadResponse(List<String> skillsFound, String projectsSummary) {}
