import csv, collections
from pathlib import Path
p=Path(__file__).parent/'backend/src/main/resources/seed-data/campus_questions.psv'
rows=list(csv.DictReader(p.open(),delimiter='|'))
assert len(rows)>=300
assert len({(r['company'],r['question']) for r in rows})==len(rows)
for r in rows:
 assert 1<=int(r['difficulty'])<=5
 assert r['origin'] in ('PUBLIC_REPORT_INSPIRED','ORIGINAL_PRACTICE')
 assert bool(r['source_url'])==(r['origin']=='PUBLIC_REPORT_INSPIRED')
 assert r['stage'] in ('INTRO','PROJECT','TECHNICAL','MANAGERIAL','HR')
for c,n in collections.Counter(r['company'] for r in rows).items():
 bank=[r for r in rows if r['company']==c and r['follow_up']=='false']
 assert {'INTRO','PROJECT','TECHNICAL','HR'} <= {r['stage'] for r in bank}
 print(c,n,'records;',len(bank),'base questions')
print('Dataset checks passed')
