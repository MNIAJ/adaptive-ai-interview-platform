package com.aiplacement.interview.config;
import com.aiplacement.interview.entity.*;
import com.aiplacement.interview.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.io.*;
import java.nio.charset.StandardCharsets;
@Component @RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
 private final CompanyRepository companyRepository;
 private final QuestionRepository questionRepository;
 @Override @Transactional public void run(String... args) throws Exception {
  try(var reader = new BufferedReader(new InputStreamReader(new ClassPathResource("seed-data/campus_questions.psv").getInputStream(), StandardCharsets.UTF_8))) {
   reader.readLine(); String line;
   while((line=reader.readLine())!=null){
    String[] a=line.split("\\|",-1);
    Company c=companyRepository.findByName(a[0]).orElseGet(()->companyRepository.save(Company.builder().name(a[0]).focusAreas("Public interview report inspired practice").difficultyProfile("MEDIUM").build()));
    Question q=questionRepository.findFirstByCompanyIdAndText(c.getId(),a[4]).orElseGet(Question::new);
    q.setCompany(c); q.setStage(a[1]); q.setTopic(a[2]); q.setBaseDifficulty(Integer.parseInt(a[3])); q.setText(a[4]); q.setOrigin(a[5]); q.setSourceUrl(a[6]); q.setFollowUp(Boolean.parseBoolean(a[7])); q.setApproved(true); questionRepository.save(q);
   }
  }
 }
}
