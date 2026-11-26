import { build } from 'esbuild';
await build({entryPoints:['src/main.tsx'],bundle:true,outfile:'dist/app.js',jsx:'automatic',minify:true});
