import {dictionary} from "./russian-dictionary";
export const source = 'водогрязеторфопарафинолечение';
export const sources = [source, 'электроэнцефалография', 'достопримечательность', 'высокопроизводительный', 'нефтегазопереработка', 'радиоэлектроника'];
export function evaluate(code: string, sourceWord = source) {
 const source = sourceWord;
 code=code.trim().replace(/^print\((.*)\)$/,'$1');
 const parts=code.split('+'); if(parts.length>40) throw Error('Слишком длинное выражение');
 return parts.map(p=>{const m=p.trim().match(/^s\[(-?\d*:?[-\d]*:?[-\d]*)\]$/); if(!m) throw Error('Используй s[индекс] или s[начало:конец:шаг]');
 const a=m[1].split(':'); if(a.some(v=>v!==''&&!/^-?\d+$/.test(v)))throw Error('Индексы должны быть целыми числами'); if(a.length===1){let i=Number(a[0]);if(!a[0])throw Error('Укажи индекс');if(i<0)i+=source.length;if(i<0||i>=source.length)throw Error('Индекс за пределами строки');return source[i]}
 if(a.length>3)throw Error('В срезе максимум два двоеточия'); const n=source.length,step=a[2]?Number(a[2]):1;if(!step)throw Error('Шаг не может быть нулём');
 const norm=(v:string|undefined,def:number)=>{if(!v)return def;let x=Number(v);if(x<0)x+=n;return Math.max(step>0?0:-1,Math.min(step>0?n:n-1,x))};
 let out='';for(let i=norm(a[0],step>0?0:n-1),end=norm(a[1],step>0?n:-1);step>0?i<end:i>end;i+=step)out+=source[i];return out;
 }).join('');
}
export const words=new Set((dictionary+'\n'+'вода водоём водоворот город гора горе год род рот ров вор двор дрова дно дровни грязь торф фото пара парафин финал фара фон фора флот филе лето тело тлен лечение лото лот лев лес лиса лира лицо цена цепь пена пение пион пир перо пол поле пора порог порода плод дело дерево дол доля долина дева диво овод олово олени олень ореол орел река родина рог рога роза ровно рано реле редька ген гений глина игра игла иго нога ноги неон нерв нора народ наряд небо налог огород ограда опера орган орден оратор рана радар район радио вино вера верно ведро вред время волна вол вода ввод вывод гол голод горло горн грань граф графин гриф дар дарение дело доение дояр едва еда еле енот ера лава лад леди лед лень лен лига лимон линия лоно лорд лори мыло налив народ нервы ноль один ода озеро око он она они пила план плен плод плов полено полив пони право правило прение прием равнина ранг рано реал риф рифление рондо роль ролл рыло тир тон топ топор три трио фонарь фраер хор хоровод чай чин шило яд явление').split(/\s+/));

export function scoreExpression(code:string, sourceWord=source){
 const word=evaluate(code,sourceWord);
 const parts=code.trim().replace(/^print\((.*)\)$/,'$1').split('+');
 const slices=parts.filter(part=>part.includes(':')&&evaluate(part.trim(),sourceWord).length>=2).length;
 const base=word.length*10,bonus=slices*10;
 return {word,base,bonus,total:base+bonus};
}
