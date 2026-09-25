package com.aiplacement.interview.config;

import com.aiplacement.interview.entity.Company;
import com.aiplacement.interview.entity.Question;
import com.aiplacement.interview.repository.CompanyRepository;
import com.aiplacement.interview.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final QuestionRepository questionRepository;

    private static final Map<String, String[]> TCS_LEVELS = Map.of(
            "TCS Ninja",   new String[]{"CS Fundamentals, DBMS, OOP, Communication", "LOW"},
            "TCS Digital", new String[]{"DSA, SQL, OOP, DBMS, System Design", "MEDIUM"},
            "TCS Prime",   new String[]{"DSA, SQL, OOP, DBMS, Aptitude Reasoning", "MEDIUM"}
    );

    @Override
    public void run(String... args) {

        seedFollowUps();
        seedTcsFromCsv("seed-data/tcs_questions.csv");

        seedCompany("Amazon", "DSA, Leadership Principles, System Design", "HIGH", new String[][]{
                {"DSA", "3", "Explain the difference between an ArrayList and a LinkedList, and when you'd choose one over the other."},
                {"DSA", "3", "How would you detect a cycle in a linked list?"},
                {"Leadership Principles", "3", "Tell me about a time you disagreed with a teammate. How did you handle it?"},
                {"Leadership Principles", "3", "Describe a time you had to make a decision with incomplete information."},
                {"System Design", "4", "How would you design a rate limiter for an API?"},
                {"System Design", "4", "How would you design a URL shortener like bit.ly?"},
        });

        seedCompany("Microsoft", "OOP, DSA, Problem Solving", "HIGH", new String[][]{
                {"OOP", "3", "Explain the four pillars of Object-Oriented Programming with a real example."},
                {"DSA", "3", "Given an array, find two numbers that add up to a target sum. Explain your approach and its complexity."},
                {"Problem Solving", "3", "How would you design a parking lot system? What classes would you need?"},
                {"System Design", "4", "How would you design a notification system that scales to millions of users?"},
                {"DSA", "3", "What's the difference between BFS and DFS, and when would you use each?"},
                {"Problem Solving", "3", "Tell me about the most challenging bug you've fixed and how you found it."},
        });

        seedCompany("Google", "DSA, System Design, Problem Solving", "HIGH", new String[][]{
                {"DSA", "4", "How would you find the kth largest element in an unsorted array, and what's the most efficient approach?"},
                {"System Design", "4", "How would you design a system like Google Docs that supports real-time collaborative editing?"},
                {"Problem Solving", "3", "How do you approach a problem you have absolutely no idea how to solve?"},
                {"DSA", "4", "Explain how a hash map works internally, including how collisions are handled."},
                {"System Design", "4", "How would you design a web crawler?"},
                {"Problem Solving", "3", "Tell me about a project where you had to learn a new technology quickly."},
        });

        seedCompany("Infosys", "CS Fundamentals, Communication, DBMS", "MEDIUM", new String[][]{
                {"CS Fundamentals", "2", "Explain the difference between process and thread."},
                {"CS Fundamentals", "2", "What happens when you type a URL into a browser and press enter?"},
                {"DBMS", "2", "What are ACID properties in a database transaction?"},
                {"Communication", "2", "Tell me about yourself and why you want to join this company."},
                {"CS Fundamentals", "2", "What is the difference between TCP and UDP?"},
                {"Communication", "2", "Describe a group project you worked on and your specific contribution."},
        });

        seedCompany("Accenture", "Communication, OOP, Aptitude Reasoning", "MEDIUM", new String[][]{
                {"Communication", "2", "Why should we hire you over other candidates?"},
                {"OOP", "2", "What is polymorphism? Give a real-world analogy."},
                {"Aptitude Reasoning", "2", "How would you prioritize tasks when everything seems urgent?"},
                {"Communication", "2", "Describe a situation where you had to work under a tight deadline."},
                {"OOP", "2", "What is method overloading vs method overriding?"},
                {"Aptitude Reasoning", "2", "If you found a major bug right before a release, what would you do?"},
        });

        seedCompany("Capgemini", "Communication, DSA, DBMS", "MEDIUM", new String[][]{
                {"Communication", "2", "What are your strengths and weaknesses?"},
                {"DSA", "2", "Explain how you would reverse a string without using built-in functions."},
                {"DBMS", "2", "What is a JOIN in SQL? Explain the different types."},
                {"Communication", "2", "Where do you see yourself in five years?"},
                {"DSA", "2", "What is the time complexity of binary search, and why does it work?"},
                {"DBMS", "2", "What is indexing in a database and why does it speed up queries?"},
        });

        seedCompany("Deloitte", "Communication, Aptitude Reasoning, CS Fundamentals", "MEDIUM", new String[][]{
                {"Communication", "2", "Tell me about a time you received difficult feedback. How did you respond?"},
                {"Aptitude Reasoning", "2", "How would you handle a disagreement with your manager?"},
                {"CS Fundamentals", "2", "What is the difference between a compiler and an interpreter?"},
                {"Communication", "2", "Describe a time you had to convince someone to see things your way."},
                {"Aptitude Reasoning", "2", "How do you stay organized when juggling multiple priorities?"},
                {"CS Fundamentals", "2", "Explain what an operating system does, in your own words."},
        });
    }

    private void seedCompany(String name, String focusAreas, String difficultyProfile, String[][] questions) {
        if (companyRepository.findByName(name).isPresent()) {
            return;
        }
        Company company = companyRepository.save(Company.builder()
                .name(name)
                .focusAreas(focusAreas)
                .difficultyProfile(difficultyProfile)
                .build());

        for (String[] q : questions) {
            questionRepository.save(Question.builder()
                    .company(company)
                    .text(q[2])
                    .topic(q[0])
                    .baseDifficulty(Integer.parseInt(q[1]))
                    .isFollowUp(false)
                    .approved(true)
                    .build());
        }
    }

    // Reads one shared file for all TCS levels. Rows are:
    // company|topic|difficulty|text  — pipe-delimited so commas inside
    // question text never break parsing. Each unique company value in the
    // file becomes its own Company row (TCS Ninja / TCS Digital / TCS Prime),
    // matched against StartInterviewRequest.companyName the same way any
    // other company is.
    private void seedTcsFromCsv(String resourcePath) {
        Map<String, Company> companyCache = new HashMap<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource(resourcePath).getInputStream()))) {

            reader.lines().skip(1) // header row
                    .filter(line -> !line.isBlank())
                    .forEach(line -> {
                        String[] parts = line.split("\\|", 4);
                        String companyName = parts[0].trim();
                        String topic = parts[1].trim();
                        int difficulty = Integer.parseInt(parts[2].trim());
                        String text = parts[3].trim();

                        Company company = companyCache.computeIfAbsent(companyName, name ->
                                companyRepository.findByName(name).orElseGet(() -> {
                                    String[] meta = TCS_LEVELS.getOrDefault(name, new String[]{"General", "MEDIUM"});
                                    return companyRepository.save(Company.builder()
                                            .name(name)
                                            .focusAreas(meta[0])
                                            .difficultyProfile(meta[1])
                                            .build());
                                })
                        );

                        // Skip only THIS question if it's already in the DB for this
                        // company — everything else in the file still gets checked
                        // and added if new.
                        if (questionRepository.existsByCompanyIdAndText(company.getId(), text)) {
                            return;
                        }

                        questionRepository.save(Question.builder()
                                .company(company)
                                .topic(topic)
                                .baseDifficulty(difficulty)
                                .text(text)
                                .isFollowUp(false)
                                .approved(true)
                                .build());
                    });
        } catch (Exception e) {
            throw new RuntimeException("Failed to seed TCS questions from " + resourcePath, e);
        }
    }

    private void seedFollowUps() {
        save("DSA", "Can you give a concrete example with time complexity for the operations you mentioned?");
        save("Leadership Principles", "What would you do differently if it happened again?");
        save("System Design", "What happens when two requests arrive at the exact same millisecond — how does your design handle that?");
        save("DBMS", "Can you give an example of a table that violates 2NF and show how you'd fix it?");
        save("OOP", "Which of those principles do you think is hardest to follow in a real codebase, and why?");
        save("Problem Solving", "What's the first command or tool you'd reach for, specifically?");
        save("Communication", "Can you walk me through a specific example rather than speaking generally?");
        save("CS Fundamentals", "Can you explain that with a concrete, real-world example?");
        save("Aptitude Reasoning", "What specific steps would you take, in order?");
    }

    private void save(String topic, String text) {
        questionRepository.save(Question.builder()
                .text(text).topic(topic).baseDifficulty(2).isFollowUp(true).approved(true).build());
    }
}