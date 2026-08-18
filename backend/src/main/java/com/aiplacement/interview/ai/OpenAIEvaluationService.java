package com.aiplacement.interview.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

// Set app.ai.provider=openai and OPENAI_API_KEY env var to activate this
// instead of the mock. Uses structured-output-style prompting: we ask the
// model to return ONLY a JSON object so we can parse score + feedback
// reliably, which is the standard pattern for LLM evaluation pipelines.
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "openai")
public class OpenAIEvaluationService implements AIEvaluationService {

    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.ai.openai.api-key:}")
    private String apiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String model;

    public OpenAIEvaluationService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
    }

    @Override
    public EvaluationResult evaluate(String questionText, String topic, String answerText) {
        String prompt = """
            You are evaluating a student's mock interview answer for a %s question.

            Question: %s
            Student answer: %s

            Score the answer from 1-10 based on correctness, depth, and use of a
            concrete example. Respond with ONLY a JSON object, no other text:
            {"score": <int 1-10>, "feedback": "<one or two sentence feedback>"}
            """.formatted(topic, questionText, answerText);

        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", new Object[]{ Map.of("role", "user", "content", prompt) },
            "temperature", 0.3
        );

        try {
            String responseJson = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = mapper.readTree(responseJson);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            JsonNode parsed = mapper.readTree(content);
            return new EvaluationResult(parsed.get("score").asInt(), parsed.get("feedback").asText());
        } catch (Exception e) {
            // Never let an AI provider outage break the interview flow —
            // fail safe to a neutral score and log for investigation.
            return new EvaluationResult(5, "Automated evaluation unavailable right now; manual review recommended.");
        }
    }
}
