import assert from 'node:assert/strict';
import test from 'node:test';
import { createVideoCache, isVideoRangeBuffered, selectHomeVideoAssets, waitForVideoFrame } from '../app/home-media.ts';
class Video extends EventTarget {
 readyState=0; currentTime=0; seeking=false; error=null; ranges=[];
 get buffered(){return {length:this.ranges.length,start:i=>this.ranges[i][0],end:i=>this.ranges[i][1]};}
 emit(event){this.dispatchEvent(new Event(event));}
}
test('one small responsive video serves both playback and scrubbing',()=>{
 const desktop=selectHomeVideoAssets({viewportWidth:1440});
 const mobile=selectHomeVideoAssets({viewportWidth:390});
 assert.equal(desktop.master,desktop.scrub); assert.equal(mobile.master,mobile.scrub);
 assert.notEqual(desktop.master,mobile.master);
 assert.deepEqual(selectHomeVideoAssets({viewportWidth:1440,saveData:true}),mobile);
 assert.deepEqual(selectHomeVideoAssets({viewportWidth:1440,effectiveType:'3g'}),mobile);
});
test('entry waits for the entire response, then reuses one object URL on return',async()=>{
 let control,requests=0;
 const stream=new ReadableStream({start(c){control=c;}});
 const load=createVideoCache(async()=>{requests++;return new Response(stream,{headers:{'content-length':'4'}});});
 const progress=[];let resolved=false;
 const pending=load('/test.mp4',v=>progress.push(v)).then(url=>{resolved=true;return url;});
 control.enqueue(new Uint8Array([1,2]));
 await new Promise(r=>setTimeout(r,0));
 assert.equal(resolved,false);assert.equal(progress.at(-1),0.5);
 control.enqueue(new Uint8Array([3,4]));control.close();
 const url=await pending;
 assert.equal(progress.at(-1),1);
 const cached=await load('/test.mp4',()=>{});
 assert.equal(url,cached);assert.equal(requests,1);
 URL.revokeObjectURL(url);
});
test('failed video downloads can be retried and never produce a ready URL',async()=>{
 let requests=0;
 const load=createVideoCache(async()=>++requests===1?new Response(null,{status:503}):new Response(new Uint8Array([1,2])));
 await assert.rejects(load('/failed.mp4',()=>{}));
 const url=await load('/failed.mp4',()=>{});
 assert.equal(requests,2);URL.revokeObjectURL(url);
});
test('a fully downloaded video must still decode the opening frame before entry',async()=>{
 const video=new Video();const controller=new AbortController();let ready=false;
 const result=waitForVideoFrame(video,1.5,controller.signal).then(()=>{ready=true;});
 video.readyState=1;video.emit('loadedmetadata');assert.equal(video.currentTime,1.5);
 video.readyState=2;video.seeking=true;video.emit('loadeddata');
 await Promise.resolve();assert.equal(ready,false);
 video.seeking=false;video.emit('seeked');await result;assert.equal(ready,true);
});
test('decoder errors and unmount cancel readiness instead of skipping the loader',async()=>{
 for(const failure of ['error','abort']){
  const video=new Video();const controller=new AbortController();
  const promise=waitForVideoFrame(video,1.5,controller.signal);
  if(failure==='error')video.emit('error');else controller.abort();
  await assert.rejects(promise);
 }
});
test('chapter playback only starts with a continuous buffered range',()=>{
 const video=new Video();video.ranges=[[0,3],[10,15]];
 assert.equal(isVideoRangeBuffered(video,1.5,12),false);
 video.ranges=[[0,15]];assert.equal(isVideoRangeBuffered(video,12,1.5),true);
});
