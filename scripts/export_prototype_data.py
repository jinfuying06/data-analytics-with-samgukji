"""Export the existing read-only seed; never creates or changes a database."""
import hashlib, json, sqlite3
from pathlib import Path
root = Path(__file__).resolve().parent.parent
path = root / 'data/seed/red_cliff.db'
conn = sqlite3.connect(f'file:{path}?mode=ro', uri=True)
conn.row_factory = sqlite3.Row
rows = [dict(r) for r in conn.execute('SELECT * FROM yeonui_mentions ORDER BY chapter, name')]
for r in rows: r['excerpt'] = json.loads(r['excerpt'])
result = {'source': 'data/seed/red_cliff.db', 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'commit': '1793bc0a6239f49320b9157e59611e3ff499fb01', 'rows': rows}
(root/'frontend/lib/seed-snapshot.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
print(f'Exported {len(rows)} records, {len(set(r["name"] for r in rows))} persons')
people=[]
for row in conn.execute('SELECT * FROM jeongsa_persons ORDER BY name'):
    p=dict(row)
    p['is_minor_biography']=bool(p['is_minor_biography'])
    p['mentioned_relatives']=json.loads(p['mentioned_relatives'])
    records=[{k:v for k,v in r.items() if k!='name'} for r in rows if r['name']==p['name']]
    people.append({'name':p['name'], 'jeongsa':p, 'yeonui':records})
(root/'frontend/lib/person-snapshot.json').write_text(json.dumps(people,ensure_ascii=False))
links=[{'source':r['person_a'],'target':r['person_b'],'value':r['count']} for r in conn.execute('SELECT * FROM cooccurrence_edges WHERE count>=1')]
names={x[k] for x in links for k in ['source','target']}
counts=dict(conn.execute('SELECT name, COUNT(DISTINCT chapter) FROM yeonui_mentions GROUP BY name'))
nodes=[{'id':n,'count':counts.get(n,0)} for n in sorted(names)]
(root/'frontend/lib/network-snapshot.json').write_text(json.dumps({'nodes':nodes,'links':links},ensure_ascii=False))
