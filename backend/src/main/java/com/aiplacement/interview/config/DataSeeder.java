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
 private final org.springframework.jdbc.core.JdbcTemplate jdbc;
 @Override @Transactional public void run(String... args) throws Exception {
  // Hibernate update does not reliably widen existing PostgreSQL enum checks.
  var checks = jdbc.queryForList("SELECT conname FROM pg_constraint WHERE conrelid = 'interview_sessions'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ~* '(^|[^a-z_])type([^a-z_]|$)' AND pg_get_constraintdef(oid) LIKE '%TECHNICAL%' AND pg_get_constraintdef(oid) NOT LIKE '%SIMULATION%'", String.class);
  for (String name : checks) {
   jdbc.execute("ALTER TABLE interview_sessions DROP CONSTRAINT \"" + name.replace("\"", "\"\"") + "\"");
   jdbc.execute("ALTER TABLE interview_sessions ADD CONSTRAINT \"" + name.replace("\"", "\"\"") + "\" CHECK (type IN ('TECHNICAL','HR','BEHAVIORAL','CORE_CS','CODING','SIMULATION'))");
  }
  try(var reader = new BufferedReader(new InputStreamReader(new ClassPathResource("seed-data/campus_questions.psv").getInputStream(), StandardCharsets.UTF_8))) {
   // Retire older bank entries without deleting historical response references.
   jdbc.update("UPDATE questions SET approved=false WHERE origin IN ('ORIGINAL_PRACTICE','PUBLIC_REPORT_INSPIRED','V3_PERSONALIZED') OR origin IS NULL");
   reader.readLine(); String line;
   while((line=reader.readLine())!=null){
    String[] a=line.split("\\|",-1);
    Company c=companyRepository.findByName(a[0]).orElseGet(()->companyRepository.save(Company.builder().name(a[0]).focusAreas("Curated placement practice").difficultyProfile("MEDIUM").build()));
    Question q=questionRepository.findFirstByCompanyIdAndText(c.getId(),a[4]).orElseGet(Question::new);
    q.setCompany(c); q.setStage(a[1]); q.setTopic(a[2]); q.setBaseDifficulty(Integer.parseInt(a[3])); q.setText(a[4]); q.setOrigin(a[5]); q.setSourceUrl(a[6]); q.setFollowUp(Boolean.parseBoolean(a[7])); q.setRubric(a.length>8?a[8]:null); q.setApproved(true); questionRepository.save(q);
   }
  }
 }
}
