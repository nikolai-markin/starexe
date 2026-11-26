import {scoreExpression} from './lib/game.ts';
import assert from 'node:assert/strict';
assert.deepEqual(scoreExpression('s[12:14]+s[9:11]'),{word:'фото',base:40,bonus:20,total:60});
assert.equal(scoreExpression('s[12]+s[13]+s[9]+s[10]').total,40);
assert.equal(scoreExpression('s[12:13]+s[13]+s[9:9]+s[9]+s[10]').bonus,0);
assert.equal(scoreExpression('print(s[12:14]+s[9:11])').total,60);
assert.equal(scoreExpression('s[::-1]','кот').bonus,10);
console.log('Slice bonus checks passed');
