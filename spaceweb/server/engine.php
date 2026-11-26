<?php
declare(strict_types=1);
function chars(string $s): array { return preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY); }
function expression(string $code, string $source): array {
 if (strlen($code)>4096) throw new RuntimeException('Слишком длинное выражение');
 $code=trim($code); if(preg_match('/^print\((.*)\)$/s',$code,$m)) $code=$m[1];
 $parts=explode('+',$code);if(count($parts)>40)throw new RuntimeException('Слишком длинное выражение');
 $letters=chars($source);$n=count($letters);$word='';$bonus=0;
 foreach($parts as $part){
  if(!preg_match('/^s\[([^\]]*)\]$/',trim($part),$m))throw new RuntimeException('Используй s[индекс] или срез');
  $a=explode(':',$m[1]);foreach($a as $v)if($v!==''&&!preg_match('/^-?\d+$/',$v))throw new RuntimeException('Индексы должны быть целыми числами');
  if(count($a)===1){if($a[0]==='')throw new RuntimeException('Укажи индекс');$i=(int)$a[0];if($i<0)$i+=$n;if($i<0||$i>=$n)throw new RuntimeException('Индекс за пределами строки');$word.=$letters[$i];continue;}
  if(count($a)>3)throw new RuntimeException('В срезе максимум два двоеточия');
  $step=isset($a[2])&&$a[2]!==''?(int)$a[2]:1;if($step===0)throw new RuntimeException('Шаг не может быть нулём');
  $norm=static function(?string $v,int $default)use($n,$step):int{if($v===null||$v==='')return $default;$x=(int)$v;if($x<0)$x+=$n;return max($step>0?0:-1,min($step>0?$n:$n-1,$x));};
  $start=$norm($a[0],$step>0?0:$n-1);$end=$norm($a[1],$step>0?$n:-1);$piece='';$length=0;
  for($i=$start;$step>0?$i<$end:$i>$end;$i+=$step){$piece.=$letters[$i];$length++;}
  $word.=$piece;if($length>=2)$bonus+=10;
 }
 return ['word'=>$word,'score'=>count(chars($word))*10+$bonus];
}
function processGame(array $b,array &$rooms,int $now):array {
 $player=$b['player']??'';$action=$b['action']??'';
 if(!is_string($player)||!preg_match('/^[a-f0-9-]{36}$/',$player))throw new RuntimeException('Некорректный игрок');
 if(!in_array($action,['create','join','state','replace','answer'],true))throw new RuntimeException('Неизвестная команда');
 $sources=json_decode(file_get_contents(__DIR__.'/sources.json'),true,512,JSON_THROW_ON_ERROR);
 foreach($rooms as $key=>$r)if($r['ends']<$now-86400000)unset($rooms[$key]);
 if($action==='create'){
  $owned=array_filter($rooms,fn($r)=>$r['host']===$player&&$r['ends']>$now);if(count($owned)>=10)throw new RuntimeException('Слишком много активных комнат');
  if(count($rooms)>=10000)throw new RuntimeException('Сервер комнат занят');
  do{$code=strtoupper(bin2hex(random_bytes(3)));}while(isset($rooms[$code]));
  $rooms[$code]=['code'=>$code,'host'=>$player,'guest'=>null,'ends'=>$now+300000,'source'=>$sources[0],'round'=>0,'answers'=>[]];return ['code'=>$code];
 }
 $code=strtoupper((string)($b['code']??''));if(!isset($rooms[$code]))throw new RuntimeException('Комната не найдена');
 $r=&$rooms[$code];
 if($action==='join'&&$r['host']!==$player){if($r['guest']!==null&&$r['guest']!==$player)throw new RuntimeException('Комната уже заполнена');$r['guest']=$player;}
 if($r['host']!==$player&&$r['guest']!==$player)throw new RuntimeException('Сначала войди в комнату');
 if($action==='replace'){
  if($r['host']!==$player)throw new RuntimeException('Слово меняет создатель комнаты');
  $r['source']=$sources[(array_search($r['source'],$sources,true)+1)%count($sources)];$r['round']++;$r['ends']=$now+300000;$r['answers']=[];
 }
 if($action==='answer'){
  if(($b['round']??null)!==$r['round'])throw new RuntimeException('Слово изменилось. Собери новое слово');
  if($now>=$r['ends'])throw new RuntimeException('Раунд завершён');
  if(!is_string($b['expression']??null))throw new RuntimeException('Укажи выражение');
  $earned=expression($b['expression'],$r['source']);$word=$earned['word'];
  $dictionary="\n".file_get_contents(__DIR__.'/words.txt')."\n";
  if($word===''||strpos($dictionary,"\n".$word."\n")===false)throw new RuntimeException('Слово не найдено в словаре');
  $id=$player.':'.$word;
  if(!isset($r['answers'][$id]))$r['answers'][$id]=['player'=>$player,'word'=>$word,'score'=>$earned['score']];
 }
 // Do not reveal the opponent's player token in API responses.
 $room=$r;unset($room['answers']);$room['host']=$r['host']===$player?$player:'opponent';$room['guest']=$r['guest']===$player?$player:($r['guest']===null?null:'opponent');
 $answers=array_values($r['answers']);foreach($answers as &$a)$a['player']=$a['player']===$player?$player:'opponent';unset($a);
 return ['room'=>$room,'answers'=>$answers];
}
