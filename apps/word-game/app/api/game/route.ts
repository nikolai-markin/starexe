import {getDb} from '@/db';
import {rooms,answers} from '@/db/schema';
import {eq,and,isNull} from 'drizzle-orm';
import {evaluate,words,sources,scoreExpression} from '@/lib/game';
export async function POST(req:Request){try{const b=await req.json() as {player:string;action:string;code:string;expression:string;round:number};const db=getDb();if(!/^[a-f0-9-]{36}$/.test(b.player))throw Error('Некорректный игрок');
if(b.action==='create'){const code=crypto.randomUUID().slice(0,6).toUpperCase();await db.insert(rooms).values({code,host:b.player,ends:Date.now()+300000});return Response.json({code})}
const room=(await db.select().from(rooms).where(eq(rooms.code,String(b.code).toUpperCase())))[0];if(!room)throw Error('Комната не найдена');
if(b.action==='join'&&room.host!==b.player){if(room.guest&&room.guest!==b.player)throw Error('Комната уже заполнена');const joined=await db.update(rooms).set({guest:b.player}).where(and(eq(rooms.code,room.code),isNull(rooms.guest))).returning();if(!joined.length && room.guest!==b.player)throw Error('Комната уже заполнена');}
if(b.action!=='join'&&room.host!==b.player&&room.guest!==b.player)throw Error('Сначала войди в комнату');
if(b.action==='replace'){if(room.host!==b.player)throw Error('Слово меняет создатель комнаты');const source=sources[(sources.indexOf(room.source)+1)%sources.length];await db.update(rooms).set({source,round:room.round+1,ends:Date.now()+300000}).where(and(eq(rooms.code,room.code),eq(rooms.round,room.round)));return Response.json({room:{...room,source,round:room.round+1,ends:Date.now()+300000},answers:[]});}
if(b.action==='answer'){if(b.round!==room.round)throw Error('Слово изменилось. Собери новое слово');if(Date.now()>room.ends)throw Error('Раунд завершён');const word=evaluate(b.expression,room.source);if(!words.has(word))throw Error('Слово не найдено в словаре');await db.insert(answers).values({id:room.code+':'+room.round+':'+b.player+':'+word,room:room.code,player:b.player,word,score:scoreExpression(b.expression,room.source).total}).onConflictDoNothing();}
return Response.json({room,answers:(await db.select().from(answers).where(eq(answers.room,room.code))).filter(a=>a.id.startsWith(room.code+':'+room.round+':'))});}catch(e){return Response.json({error:e instanceof Error?e.message:'Ошибка запроса'},{status:400})}}


