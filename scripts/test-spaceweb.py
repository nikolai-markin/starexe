import json,subprocess,time,urllib.request,urllib.error,uuid,pathlib,socket,os
root=pathlib.Path(__file__).resolve().parents[1]
web=root/'deploy/spaceweb/public_html'
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
proc=subprocess.Popen(['php','-S',f'127.0.0.1:{port}','-t',str(web)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
base=f'http://127.0.0.1:{port}'
try:
 for _ in range(50):
  try:urllib.request.urlopen(base,timeout=1);break
  except Exception:time.sleep(.1)
 def api(action,player,code='',**kw):
  req=urllib.request.Request(base+'/api/game/',data=json.dumps(dict(action=action,player=player,code=code,**kw)).encode(),headers={'Content-Type':'application/json'})
  try:r=urllib.request.urlopen(req)
  except urllib.error.HTTPError as e:r=e
  return json.loads(r.read())
 for path in ['/','/game/','/turtle/','/records/13-tcp-ip/','/assets/star-exe-logo.png']:
  assert urllib.request.urlopen(base+path).status==200,path
 host,guest,outsider=[str(uuid.uuid4()) for _ in range(3)]
 code=api('create',host)['code'];state=api('join',guest,code);assert state['room']['host']=='opponent'
 assert 'error' in api('join',outsider,code)
 result=api('answer',host,code,round=0,expression='s[12:14]+s[9:11]');assert result['answers'][0]['word']=='фото' and result['answers'][0]['score']==60,result
 assert len(api('answer',host,code,round=0,expression='s[12:14]+s[9:11]')['answers'])==1
 assert 'error' in api('answer',host,code,round=0,expression='s[::0]')
 assert 'error' in api('replace',guest,code)
 changed=api('replace',host,code);assert changed['room']['round']==1 and changed['answers']==[]
 assert 'error' in api('answer',guest,code,round=0,expression='s[0]')
 assert api('state',guest,code)['room']['source']==changed['room']['source']
 print('Spaceweb checks passed: 5 routes, rooms, joins, scoring, duplicates, validation, round sync')
finally:proc.terminate();proc.wait(timeout=10)
# Test data stays local and is ignored by Git; never upload rooms.json to hosting.
