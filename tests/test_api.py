import hashlib,json,sqlite3,sys,unittest
from pathlib import Path
from fastapi.testclient import TestClient
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT))
from backend.main import app
class PrototypeTests(unittest.TestCase):
 def test_all_ranges(self):
  client=TestClient(app)
  conn=sqlite3.connect(ROOT/'data/seed/red_cliff.db');conn.row_factory=sqlite3.Row
  snapshot=json.loads((ROOT/'frontend/lib/seed-snapshot.json').read_text())
  self.assertEqual(snapshot['sha256'],hashlib.sha256((ROOT/'data/seed/red_cliff.db').read_bytes()).hexdigest())
  ranges=json.loads((ROOT/'.test-results/analytics-results.json').read_text())
  for item in ranges:
   start,end=item['start'],item['end']
   expected=[dict(r) for r in conn.execute('SELECT name,COUNT(DISTINCT chapter) AS chapter_count FROM yeonui_mentions WHERE chapter BETWEEN ? AND ? GROUP BY name ORDER BY chapter_count DESC,name',(start,end))]
   self.assertEqual(item['results'],expected)
   response=client.get(f'/api/analytics/appearances?chapter_start={start}&chapter_end={end}')
   self.assertEqual(response.status_code,200);self.assertEqual(response.json()['results'],expected)
 def test_validation_and_existing_apis(self):
  client=TestClient(app)
  for params in ['chapter_start=42','chapter_end=51','chapter_start=50&chapter_end=43','limit=0','limit=64','chapter_start=abc']:
   self.assertEqual(client.get('/api/analytics/appearances?'+params).status_code,422)
  for route in ['/api/storylines/red-cliff','/api/persons','/api/persons/曹操','/api/network']:
   self.assertEqual(client.get(route).status_code,200)
if __name__=='__main__':unittest.main()
