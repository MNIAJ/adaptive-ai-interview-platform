package com.aiplacement.interview.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Real LLM evaluation via Spring AI instead of a hand-rolled WebClient call
 * (compare to OpenAIEvaluationService.java, which does the same thing "by
 * hand" — this is the Spring AI equivalent, worth knowing since Spring AI
 * is Spring's own answer to LangChain and is genuinely new/impressive to
 * bring up in interviews).
 *
 * Activate with: app.ai.provider=springai and OPENAI_API_KEY set.
 *
 * ChatClient is Spring AI's core abstraction — you build a request with
 * .prompt(), Spring AI handles the actual HTTP call, retries, and response
 * parsing. Compare how much shorter this is than OpenAIEvaluationService's
 * manual WebClient + Jackson parsing — that's the value Spring AI adds.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "springai")
public class SpringAIEvaluationService implements AIEvaluationService {

    private final ChatClient chatClient;

    // Spring AI auto-configures a ChatClient.Builder bean for you once the
    // spring-ai-openai-spring-boot-starter dependency + an API key are on
    // the classpath — you just inject and .build() it.
    public SpringAIEvaluationService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    private static final String TEMPLATE = """
        You are evaluating a student's mock interview answer for a {topic} question.

        Question: {question}
        Student answer: {answer}

        Score the answer from 1 to 10 based on correctness, depth, and use of a
        concrete example. A vague or off-topic answer, however long, should score
        low. Respond in EXACTLY this format and nothing else:
        SCORE: <int 1-10>
        FEEDBACK: <one or two sentence feedback>
        """;

    private static final Pattern SCORE_PATTERN = Pattern.compile("SCORE:\\s*(\\d+)");
    private static final Pattern FEEDBACK_PATTERN = Pattern.compile("FEEDBACK:\\s*(.+)", Pattern.DOTALL);

    @Override
    public EvaluationResult evaluate(String questionText, String topic, String answerText) {
        try {
            PromptTemplate promptTemplate = new PromptTemplate(TEMPLATE);
            String prompt = promptTemplate.render(Map.of(
                    "topic", topic,
                    "question", questionText,
                    "answer", answerText
            ));

            String content = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            Matcher scoreMatcher = SCORE_PATTERN.matcher(content);
            Matcher feedbackMatcher = FEEDBACK_PATTERN.matcher(content);

            int score = scoreMatcher.find() ? Integer.parseInt(scoreMatcher.group(1)) : 5;
            String feedback = feedbackMatcher.find() ? feedbackMatcher.group(1).trim() : content.trim();

            return new EvaluationResult(Math.max(1, Math.min(10, score)), feedback);
        } catch (Exception e) {
            // Same fail-safe philosophy as OpenAIEvaluationService — never let
            // a provider outage break someone's mock interview mid-session.
            return new EvaluationResult(5, "Automated evaluation unavailable right now; manual review recommended.");
        }
    }
}
