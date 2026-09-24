import test from 'node:test';
import assert from 'node:assert/strict';
import {ROUNDS,newSession,makeRound,advanceTime,interact,startPour,stopPour,nextRound,resultProfile,finish} from '../src/office/game.js';
test('eight short rounds contain two of each interaction',()=>{
 assert.equal(ROUNDS.length,8);
 for(const type of ['scope','align','coffee','alarms'])assert.equal(ROUNDS.filter(r=>r.type===type).length,2);
});
test('seeded challenges reproduce labels and directions',()=>{
 assert.deepEqual(newSession(5),newSession(5));
 assert.notDeepEqual(makeRound(0,1).notes,makeRound(0,7).notes);
});
test('clock does not run while the player reads the instruction',()=>{
 const r=makeRound(0,1);advanceTime(r,100);assert.equal(r.status,'ready');assert.equal(r.elapsed,0);
});
test('shredder requires distinct requests; invalid targets do not start timer',()=>{
 const r=makeRound(0,1);assert.equal(interact(r,-1),'ignored');assert.equal(r.status,'ready');
 interact(r,0);interact(r,0);assert.equal(r.hits,1);
 for(let i=1;i<r.goal;i++)interact(r,i);
 assert.equal(r.status,'won');assert.equal(interact(r,0),'ignored');
});
test('leadership starts misaligned and every boss must point right',()=>{
 const r=makeRound(1,1);assert.ok(r.directions.every(x=>x!==0));
 for(let i=0;i<r.goal;i++)while(r.directions[i]!==0)interact(r,i);
 assert.equal(r.status,'won');assert.equal(r.hits,r.goal);
});
test('wrong dashboard targets do not count; red flags move after a hit',()=>{
 const r=makeRound(3,1),old=r.alarm;interact(r,(old+1)%9);assert.equal(r.hits,0);assert.equal(r.misfires,1);
 interact(r,old);assert.notEqual(r.alarm,old);assert.equal(r.hits,1);
 while(r.status==='active')interact(r,r.alarm);assert.equal(r.status,'won');
});
test('releasing coffee in target band succeeds; hold alone is not success',()=>{
 const r=makeRound(2,1);startPour(r);advanceTime(r,72/r.rate);assert.equal(r.status,'active');
 assert.equal(stopPour(r),'hit');assert.equal(r.status,'won');
});
test('a short pour can be retried within the same countdown',()=>{
 const r=makeRound(2,1);startPour(r);advanceTime(r,.5);assert.equal(stopPour(r),'short');assert.equal(r.fill,0);
 assert.equal(r.status,'active');assert.equal(r.elapsed,.5);assert.equal(r.attempts,1);
});
test('overfilling and timing out produce a funny failure, not a blocked session',()=>{
 const r=makeRound(2,1);startPour(r);advanceTime(r,3);assert.equal(r.status,'lost');
 const q=makeRound(0,1);interact(q,0);advanceTime(q,q.seconds);assert.equal(q.status,'lost');
});
test('no-timer mode disables deadlines but preserves coffee timing',()=>{
 const r=makeRound(0,1);interact(r,0);advanceTime(r,100,true);assert.equal(r.status,'active');assert.equal(r.elapsed,0);
 const q=makeRound(2,1);startPour(q);advanceTime(q,2,true);assert.equal(q.fill,68);assert.equal(q.elapsed,0);
 assert.equal(stopPour(q),'hit');
});
test('completed rounds cannot be scored twice or advance past final results',()=>{
 const s=newSession(1);assert.equal(nextRound(s),false);
 for(let i=0;i<8;i++){finish(s.round,i%2===0);assert.equal(nextRound(s),true);}
 assert.equal(s.results.length,8);assert.equal(nextRound(s),false);assert.equal(resultProfile(s).score,4);
});
test('a full perfect session earns a positive result without persistent progress',()=>{
 const s=newSession(17);
 for(let i=0;i<8;i++){const r=s.round;if(r.type==='scope'){for(let n=0;n<r.goal;n++)interact(r,n);}
 else if(r.type==='align'){for(let n=0;n<r.goal;n++)while(r.directions[n]!==0)interact(r,n);}
 else if(r.type==='coffee'){startPour(r);advanceTime(r,74/r.rate);stopPour(r);}
 else while(['ready','active'].includes(r.status))interact(r,r.alarm);
 assert.equal(r.status,'won');nextRound(s);}
 assert.equal(resultProfile(s).title,'Director of Somehow');assert.equal(resultProfile(s).score,8);
});
