import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'deploy/spaceweb'),web=path.join(target,'public_html');
const read=p=>fs.readFile(path.join(root,p),'utf8');
async function write(p,s){await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,s)}
function links(html){return html.replaceAll('https://star-exe.namarkingpt.chatgpt.site/','/').replaceAll('https://slice-pop-ege.namarkingpt.chatgpt.site/','/game/').replaceAll('https://star-exe-turtle.namarkingpt.chatgpt.site/','/turtle/').replaceAll('https://star-exe-ip13.namarkingpt.chatgpt.site/','/records/13-tcp-ip/');}
export async function buildSpaceweb(options={}){
 const esbuild=options.esbuild??await import('esbuild');
 await fs.mkdir(web,{recursive:true});
 await fs.cp(path.join(root,'apps/home/dist'),web,{recursive:true});
 await fs.cp(path.join(root,'apps/turtle/dist'),path.join(web,'turtle'),{recursive:true});
 await fs.cp(path.join(root,'apps/ip13/dist'),path.join(web,'records/13-tcp-ip'),{recursive:true});
 await fs.mkdir(path.join(web,'assets'),{recursive:true});
 await fs.copyFile(path.join(web,'star-exe-transparent.png'),path.join(web,'assets/star-exe-logo.png'));
 const logoCss='\n.logo,.brand-logo{clip-path:none!important;overflow:visible!important;aspect-ratio:auto!important;height:90px;display:flex;align-items:center}.logo img,.brand-logo img{position:static!important;display:block;width:100%!important;height:100%!important;object-fit:contain;max-width:100%!important}\n';
 for(const [html,css] of [['index.html','style.css'],['turtle/index.html','turtle/app.css'],['records/13-tcp-ip/index.html','records/13-tcp-ip/style.css']]){
  let s=links(await fs.readFile(path.join(web,html),'utf8'));
  s=s.replace(/src="star-exe-(?:brand|transparent)\.png"/g,'src="/assets/star-exe-logo.png"');
  if(html==='turtle/index.html')s=s.replaceAll('href="/app.css"','href="./app.css"').replaceAll('src="/app.js"','src="./app.js"');
  await write(path.join(web,html),s);await fs.appendFile(path.join(web,css),logoCss);
 }
 // Rebuild the React pages as browser-only bundles; the game API is supplied by PHP.
 const buildDir=path.join(root,'.build');await fs.mkdir(buildDir,{recursive:true});
 let game=await read('apps/word-game/app/page.tsx');game=links(game).replace("'@/lib/game'","'../apps/word-game/lib/game'").replace("fetch('/api/game'","fetch('/api/game/'").replace('src="/star-exe-brand.png"','src="/assets/star-exe-logo.png"');
 game+="\nimport {createRoot} from 'react-dom/client';import '../apps/word-game/app/globals.css';createRoot(document.getElementById('root')!).render(<Page/>);";
 await write(path.join(buildDir,'game.tsx'),game);
 await esbuild.build({entryPoints:[path.join(buildDir,'game.tsx')],bundle:true,outfile:path.join(web,'game/app.js'),jsx:'automatic',minify:true,nodePaths:options.nodePaths??[]});
 await fs.appendFile(path.join(web,'game/app.css'),logoCss);
 await write(path.join(web,'game/index.html'),'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>STAR.exe — Водогрязеторфопарафинолечение</title><link rel="stylesheet" href="./app.css"></head><body><div id="root"></div><script type="module" src="./app.js"></script></body></html>');
 let turtle=links(await read('apps/turtle/src/main.tsx')).replace('src="/star-exe-brand.png"','src="/assets/star-exe-logo.png"').replace('href="/turtle-cutout.png"','href="/turtle/turtle-cutout.png"').replace("from './turtle'","from '../apps/turtle/src/turtle'").replace("import './style.css'","import '../apps/turtle/src/style.css'");
 await write(path.join(buildDir,'turtle.tsx'),turtle);
 await esbuild.build({entryPoints:[path.join(buildDir,'turtle.tsx')],bundle:true,outfile:path.join(web,'turtle/app.js'),jsx:'automatic',minify:true,nodePaths:options.nodePaths??[]});
 await fs.appendFile(path.join(web,'turtle/app.css'),logoCss);
 await esbuild.build({entryPoints:[path.join(root,'apps/word-game/lib/game.ts')],bundle:true,platform:'node',format:'cjs',outfile:path.join(buildDir,'game-data.cjs')});
 const {words,sources}=createRequire(import.meta.url)(path.join(buildDir,'game-data.cjs'));
 await write(path.join(target,'server/words.txt'),[...words].join('\n'));
 await write(path.join(target,'server/sources.json'),JSON.stringify(sources));
 await fs.copyFile(path.join(root,'apps/word-game/data/russian-words-LICENSE.txt'),path.join(target,'server/russian-words-LICENSE.txt')); 
 await fs.cp(path.join(root,'spaceweb/server'),path.join(target,'server'),{recursive:true});
 await fs.cp(path.join(root,'spaceweb/storage'),path.join(target,'storage'),{recursive:true});
 await write(path.join(web,'api/game/index.php'),"<?php\nrequire dirname(__DIR__, 3) . '/server/game.php';\n");
 await write(path.join(web,'.htaccess'),"Options -Indexes\nDirectoryIndex index.html\n<FilesMatch \"\\.(?:env|sqlite|lock|log)$\">\nRequire all denied\n</FilesMatch>\n");
 console.log('Ready: deploy/spaceweb (public_html + server + storage)');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildSpaceweb();
