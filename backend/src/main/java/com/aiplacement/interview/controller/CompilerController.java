package com.aiplacement.interview.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.Semaphore;
@RestController
@RequestMapping("/api/compiler")
public class CompilerController {
 @Value("${JUDGE0_URL:https://api.onlinecompiler.io/api/judge0}") String url;
 @Value("${ONLINECOMPILER_API_KEY:}") String key;
 private final ObjectMapper mapper;
 private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
 private final Semaphore slots=new Semaphore(2);
 public CompilerController(ObjectMapper mapper){this.mapper=mapper;}
 public record Run(int languageId,String code,String input){}
 @PostMapping("/run") public Object run(@RequestBody Run r){
 if(url.isBlank()||key.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Configure ONLINECOMPILER_API_KEY on the backend first");
 if(!Set.of(62,71,50,54,63).contains(r.languageId())||r.code()==null||r.code().length()>12000||r.input()==null||r.input().length()>4000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid code or input");
 if(!slots.tryAcquire())throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Compiler busy");
 try{var body=Map.of("language_id",r.languageId(),"source_code",r.code(),"stdin",r.input(),"cpu_time_limit",2);
 var b=HttpRequest.newBuilder(URI.create(url.replaceAll("/+$","")+"/submissions?base64_encoded=false&wait=true")).timeout(Duration.ofSeconds(25)).header("Content-Type","application/json");
 b.header("X-Auth-Token",key);
 var res=client.send(b.POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build(),HttpResponse.BodyHandlers.ofString());
 if(res.statusCode()==429)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Compiler quota exhausted");
 if(res.statusCode()/100!=2)throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Compiler provider returned "+res.statusCode());
 return mapper.readTree(res.body());
 }catch(ResponseStatusException e){throw e;}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Compiler unavailable",e);}finally{slots.release();}
 }
}
