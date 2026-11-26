<?php
declare(strict_types=1);
require __DIR__.'/engine.php';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
$lock=null;
try {
 if(($_SERVER['REQUEST_METHOD']??'')!=='POST'){http_response_code(405);header('Allow: POST');throw new RuntimeException('Используй POST');}
 $raw=file_get_contents('php://input',false,null,0,16385);if(strlen($raw)>16384)throw new RuntimeException('Слишком большой запрос');
 $b=json_decode($raw,true,512,JSON_THROW_ON_ERROR);if(!is_array($b))throw new RuntimeException('Некорректный запрос');
 $storage=dirname(__DIR__).'/storage';if(!is_dir($storage)||!is_writable($storage))throw new RuntimeException('Хранилище комнат недоступно');
 $lock=fopen($storage.'/rooms.lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Хранилище занято');
 $file=$storage.'/rooms.json';$rooms=is_file($file)?json_decode(file_get_contents($file),true,512,JSON_THROW_ON_ERROR):[];
 $result=processGame($b,$rooms,(int)floor(microtime(true)*1000));
 $tmp=$storage.'/rooms.'.bin2hex(random_bytes(4)).'.tmp';
 if(file_put_contents($tmp,json_encode($rooms,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR))===false||!rename($tmp,$file))throw new RuntimeException('Не удалось сохранить комнату');
 flock($lock,LOCK_UN);fclose($lock);$lock=null;
 echo json_encode($result,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
} catch(Throwable $e){
 if(is_resource($lock)){flock($lock,LOCK_UN);fclose($lock);}
 if(http_response_code()<400)http_response_code(400);
 $message=$e instanceof RuntimeException?$e->getMessage():'Ошибка сервера комнат';
 echo json_encode(['error'=>$message],JSON_UNESCAPED_UNICODE);
}
