import {trace} from './src/turtle.ts';
import assert from 'node:assert/strict';
const f=trace(`speed(0)
tracer(0)
penup()
for x in range(2):
    for y in range(3):
        goto(x*40,y*40)
        dot(6, "red")
done()`);
assert.equal(f.filter(x=>x.dot).length,6);
assert.equal(f.filter(x=>x.dot)[0].dotColor,'red');
assert.equal(f.at(-1).flush,true);
assert.equal(f.at(-1).speed,0);
assert.equal(f.some(x=>x.draw),false);
assert.equal(trace('speed(10)\nfd(40)\nlt(90)\nbk(10)').at(-1).y,-10);
console.log('Turtle command checks passed');
