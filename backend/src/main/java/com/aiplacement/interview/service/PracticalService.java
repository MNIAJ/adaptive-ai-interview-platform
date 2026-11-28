package com.aiplacement.interview.service;
import com.aiplacement.interview.controller.CompilerController;
import com.aiplacement.interview.entity.Question;
import com.aiplacement.interview.ai.AIEvaluationService.EvaluationResult;
import com.aiplacement.interview.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import java.util.*;
@Service
public class PracticalService {
 private final CompilerController compiler;
 public PracticalService(CompilerController compiler){this.compiler=compiler;}
 public static boolean practical(Question q){return "PRACTICAL_CODE".equals(q.getStage())||"PRACTICAL_SQL".equals(q.getStage())||"PRACTICAL_REACT".equals(q.getStage());}
 private JsonNode run(int lang,String code,String input){try{return (JsonNode)compiler.run(new CompilerController.Run(lang,code,input));}catch(org.springframework.web.server.ResponseStatusException e){throw new ApiException(HttpStatus.valueOf(e.getStatusCode().value()),e.getReason());}}
 private boolean accepted(JsonNode n){int id=n.path("status").path("id").asInt();if(id<3||id>=13)throw new ApiException(HttpStatus.BAD_GATEWAY,"Execution service did not complete. Retry.");return id==3;}
 private String sqlProgram(String query, boolean sample){
  String encoded=Base64.getEncoder().encodeToString(query.getBytes(java.nio.charset.StandardCharsets.UTF_8));
  return "import sqlite3,base64,json\nq=base64.b64decode('"+encoded+"').decode()\n"+"datasets="+(sample?"[[(1,'Ana',60000),(2,'Bob',40000),(3,'Dev',50000)]]":"[[(1,'Ana',60000),(2,'Bob',40000),(3,'Dev',50000)],[(1,'X',50000),(2,'Y',49999),(3,'Z',90000)],[(1,'A',100),(2,'B',200)]]")+"\nfor rows in datasets:\n c=sqlite3.connect(':memory:')\n c.execute('CREATE TABLE employees(id INTEGER, name TEXT, salary INTEGER)')\n c.executemany('INSERT INTO employees VALUES(?,?,?)',rows)\n expected=c.execute('SELECT name FROM employees WHERE salary >= 50000 ORDER BY name').fetchall()\n c.set_authorizer(lambda action,a,b,db,src: sqlite3.SQLITE_OK if action in (sqlite3.SQLITE_SELECT,sqlite3.SQLITE_READ,sqlite3.SQLITE_FUNCTION) else sqlite3.SQLITE_DENY)\n try:\n  actual=c.execute(q).fetchmany(100)\n  print(json.dumps(actual) if "+(sample?"True":"False")+" else ('PASS' if actual==expected else 'FAIL'))\n except sqlite3.Error as e:\n  print('SQL error: '+str(e) if "+(sample?"True":"False")+" else 'FAIL')\n c.close()\n";
 }
 private String reactProgram(String code,String name){
  String encoded=Base64.getEncoder().encodeToString(code.getBytes(java.nio.charset.StandardCharsets.UTF_8));
  return "const React={createElement:(type,props,...children)=>({type,props,children})};\n"+"const vm=require('vm'); const ctx=vm.createContext({React});\n"+"vm.runInContext(Buffer.from('"+encoded+"','base64').toString(),ctx,{timeout:500});\n"+"const result=vm.runInContext('Greeting("+name+")',ctx,{timeout:500});\n"+"console.log(JSON.stringify([result.type,result.children.join('')]));";
 }
 public Map<String,Object> preview(Question q,int lang,String code,String input){validate(q,lang,code);if("PRACTICAL_REACT".equals(q.getStage())){JsonNode n=run(63,reactProgram(code,"{name:'Ana'}"),"");accepted(n);return Map.of("output",n.path("stdout").asText(""),"detail",n.path("stderr").asText(""),"status",n.path("status").path("description").asText("Unknown"));}JsonNode n=run("PRACTICAL_SQL".equals(q.getStage())?71:lang,"PRACTICAL_SQL".equals(q.getStage())?sqlProgram(code,true):code,"PRACTICAL_SQL".equals(q.getStage())?"":input);accepted(n);return Map.of("output",n.path("stdout").asText(""),"detail",n.path("compile_output").asText(n.path("stderr").asText("")),"status",n.path("status").path("description").asText("Unknown"));}
 private void validate(Question q,int lang,String code){if(!practical(q)||code==null||code.isBlank()||code.length()>4000||(!"PRACTICAL_SQL".equals(q.getStage())&&!Set.of(62,71,50,54,63).contains(lang)))throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid practical submission");}
 public EvaluationResult grade(Question q,int lang,String code){validate(q,lang,code);int passed=0;String detail="";
 if("PRACTICAL_REACT".equals(q.getStage())){String[][] tests={{"{name:'Ana'}","Ana"},{"{name:''}","Guest"},{"{}","Guest"}};for(String[] t:tests){JsonNode n=run(63,reactProgram(code,t[0]),"");if(accepted(n)&&n.path("stdout").asText("").trim().equals("[\"h2\",\"Hello, "+t[1]+"!\"]"))passed++;}}
 else if("PRACTICAL_SQL".equals(q.getStage())){JsonNode n=run(71,sqlProgram(code,false),"");if(accepted(n))passed=(int)n.path("stdout").asText("").lines().filter("PASS"::equals).count();}
 else {String[][] tests={{"5\n3 -2 9 1 4\n","9"},{"4\n-8 -3 -12 -4\n","-3"},{"1\n7\n","7"}};for(String[] t:tests){JsonNode n=run(lang,code,t[0]);if(accepted(n)&&n.path("stdout").asText("").trim().equals(t[1]))passed++;if(n.path("status").path("id").asInt()==6){detail=" Compilation failed.";break;}}}
 return new EvaluationResult((int)Math.round(passed*10.0/3),passed+"/3 test cases passed."+detail+(passed==3?" Correct output on all tests.":" Review edge cases and output format."));}
}
