package com.aiplacement.interview.config;

import com.aiplacement.interview.entity.Company;
import com.aiplacement.interview.entity.Question;
import com.aiplacement.interview.repository.CompanyRepository;
import com.aiplacement.interview.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Runs once on startup and seeds a couple of companies + question banks so
// you have something to interview against immediately. In the real product
// this data comes from Faculty/Admin CRUD screens (Phase 4 of the roadmap) —
// this seeder is just so Phase 1-3 aren't blocked waiting on that UI.
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final QuestionRepository questionRepository;

    @Override
    public void run(String... args) {
        if (companyRepository.count() > 0) return; // already seeded

        Company amazon = companyRepository.save(Company.builder()
                .name("Amazon")
                .focusAreas("DSA, Leadership Principles, System Design")
                .difficultyProfile("HIGH")
                .build());

        Company tcs = companyRepository.save(Company.builder()
                .name("TCS Digital")
                .focusAreas("DBMS, OOP, Problem Solving")
                .difficultyProfile("MEDIUM")
                .build());

        // Base questions
        questionRepository.save(Question.builder().company(amazon)
                .text("Explain the difference between an ArrayList and a LinkedList, and when you'd choose one over the other.")
                .topic("DSA").baseDifficulty(3).isFollowUp(false).approved(true).build());
        questionRepository.save(Question.builder().company(amazon)
                .text("Tell me about a time you disagreed with a teammate. How did you handle it?")
                .topic("Leadership Principles").baseDifficulty(3).isFollowUp(false).approved(true).build());
        questionRepository.save(Question.builder().company(amazon)
                .text("How would you design a rate limiter for an API?")
                .topic("System Design").baseDifficulty(4).isFollowUp(false).approved(true).build());

        questionRepository.save(Question.builder().company(tcs)
                .text("What is normalization in databases? Explain 1NF, 2NF, 3NF briefly.")
                .topic("DBMS").baseDifficulty(2).isFollowUp(false).approved(true).build());
        questionRepository.save(Question.builder().company(tcs)
                .text("Explain the SOLID principles with one example each.")
                .topic("OOP").baseDifficulty(3).isFollowUp(false).approved(true).build());
        questionRepository.save(Question.builder().company(tcs)
                .text("Walk me through how you'd approach debugging a production issue you've never seen before.")
                .topic("Problem Solving").baseDifficulty(3).isFollowUp(false).approved(true).build());

        // Follow-up questions (topic-matched, company = null so they apply everywhere)
        questionRepository.save(Question.builder()
                .text("Can you give a concrete example with time complexity for both operations you mentioned?")
                .topic("DSA").baseDifficulty(2).isFollowUp(true).approved(true).build());
        questionRepository.save(Question.builder()
                .text("What would you do differently if it happened again?")
                .topic("Leadership Principles").baseDifficulty(2).isFollowUp(true).approved(true).build());
        questionRepository.save(Question.builder()
                .text("What happens when two requests arrive at the exact same millisecond — how does your design handle that?")
                .topic("System Design").baseDifficulty(3).isFollowUp(true).approved(true).build());
        questionRepository.save(Question.builder()
                .text("Can you give an example of a table that violates 2NF and show how you'd fix it?")
                .topic("DBMS").baseDifficulty(2).isFollowUp(true).approved(true).build());
        questionRepository.save(Question.builder()
                .text("Which of those principles do you think is hardest to follow in a real codebase, and why?")
                .topic("OOP").baseDifficulty(2).isFollowUp(true).approved(true).build());
        questionRepository.save(Question.builder()
                .text("What's the first command or tool you'd reach for, specifically?")
                .topic("Problem Solving").baseDifficulty(2).isFollowUp(true).approved(true).build());
    }
}
