import sharp from 'sharp';
import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
const root = new URL('../', import.meta.url);
const files = new Set();
const data = await readFile(new URL('app/aigc/projects.ts', root), 'utf8');
for (const match of data.matchAll(/"(\/aigc\/[^"\n]+\.(?:png|jpg))"/g)) files.add(match[1]);
for (const folder of ['aigc/project-01/portraits-white-v1', 'aigc/project-01/portraits-white-v2', 'aigc/project-01/poses-alpha-v1', 'aigc/project-03/pdf-v2']) {
 for (const name of await readdir(new URL(`public/${folder}/`, root))) {
  if (/\.(?:png|webp)$/.test(name)) files.add(`/${folder}/${name}`);
 }
}
files.add('/urban/ucl-workshop/ucl-workshop-poster.jpg');
files.add('/urban/mla/page-01.jpg');
const manifest = {};
let before=0, after=0;
for (const source of [...files].sort()) {
 const src = new URL(`public${source}`, root);
 const target = `/project-media-v1${source.replace(/\.(png|jpg|webp)$/, '.webp')}`;
 const dest = new URL(`public${target}`, root);
 await mkdir(dirname(dest.pathname), {recursive:true});
 const info = await sharp(src.pathname).resize({width:1920, height:2560,fit:'inside',withoutEnlargement:true}).webp({quality:84,alphaQuality:95,effort:5}).toFile(dest.pathname);
 manifest[source] = target;
 before+=(await stat(src)).size; after+=info.size;
}
await writeFile(new URL('app/project-images.json', root), JSON.stringify(manifest,null,2)+'\n');
for (const [name,source] of [['poster','home-background-retro-desk-original-4k-poster.jpg'],['end','home-background-retro-desk-original-4k-end.jpg']]) {
 await sharp(new URL(`public/${source}`,root).pathname).resize({width:1920,withoutEnlargement:true}).webp({quality:84}).toFile(new URL(`public/home-media-v2/${name}.webp`,root).pathname);
}
console.log(`${files.size} project images: ${(before/1e6).toFixed(2)} MB → ${(after/1e6).toFixed(2)} MB`);
