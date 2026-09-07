package com.aiplacement.interview.config;

import com.aiplacement.interview.entity.Company;
import com.aiplacement.interview.entity.Question;
import com.aiplacement.interview.repository.CompanyRepository;
import com.aiplacement.interview.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// Runs once on startup and seeds companies + question banks so you have
// something to interview against immediately. In the real product this
// data comes from Faculty/Admin CRUD screens (Phase 4 of the roadmap) —
// this seeder just unblocks everything else until that UI exists.
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final QuestionRepository questionRepository;

    @Override
    public void run(String... args) {

        seedFollowUps();

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

        seedCompany("TCS Digital", "DBMS, OOP, Problem Solving", "MEDIUM", new String[][]{
            {"DBMS", "2", "What is normalization in databases? Explain 1NF, 2NF, 3NF briefly."},
            {"DBMS", "2", "What is the difference between a primary key and a foreign key?"},
            {"OOP", "3", "Explain the SOLID principles with one example each."},
            {"OOP", "2", "What's the difference between an abstract class and an interface in Java?"},
            {"Problem Solving", "3", "Walk me through how you'd approach debugging a production issue you've never seen before."},
            {"Problem Solving", "2", "How would you explain a technical concept to a non-technical stakeholder?"},
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
        if(companyRepository.findByName(name).isPresent()) {
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

    // Follow-ups are company-agnostic (company = null) and matched purely by
    // topic — AdaptiveInterviewEngine looks these up via
    // findByTopicAndApprovedTrueAndIsFollowUpTrue(). One per topic used above
    // is enough; add more later if you want variety instead of the same
    // follow-up every time a topic goes weak.
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
