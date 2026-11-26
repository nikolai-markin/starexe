import {trace} from './src/turtle.ts';
import assert from 'node:assert/strict';
const code=`from turtle import *
tracer(0)
k = 15
left(90)
for i in range(16):
    left(36)
    forward(4*k)
    left(36)
down()
for x in range(-50,50):
    for y in range(-50,50):
        goto(x*k,y*k)
        dot(3,'purple')
done()`;
const f=trace(code);
assert.equal(f.filter(x=>x.dot).length,10000);
assert.equal(f.filter(x=>x.dot)[9999].dotColor,'purple');
assert.equal(f.at(-1).flush,true);
assert.throws(()=>trace('for x in range(2):\n    for y in range(-50,50:\n        dot(3)'),/Строка 2: Проверь синтаксис/);
console.log('Full 10,000-point example passed:',f.length,'frames');
