import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBulkQuestions, bulkSchedule } from '../src/lib/ramadan-bulk.ts';
const blocks=Array.from({length:15},(_,i)=>`سؤال ${i+1}\nخيار خاطئ\n*الخيار الصحيح\nخيار آخر`);
test('parse all 15 questions and preserve the marked correct option',()=>{
    const rows=parseBulkQuestions(blocks.join('\n\n'));
    assert.equal(rows.length,15);
    assert.equal(rows[14].question,'سؤال 15');
    assert.equal(rows[0].correctIndex,1);
    assert.deepEqual(rows[0].options,['خيار خاطئ','الخيار الصحيح','خيار آخر']);
});
test('accept Windows line endings and whitespace-only separators',()=>{
    assert.equal(parseBulkQuestions(blocks.join('\n  \n').replaceAll('\n','\r\n')).length,15);
});
test('reject incomplete batches and ambiguous or empty answers',()=>{
    for(const raw of [blocks.slice(1).join('\n\n'),[...blocks,blocks[0]].join('\n\n'),blocks.join('\n\n').replace('*الخيار الصحيح','الخيار الصحيح'),blocks.join('\n\n').replace('خيار خاطئ','*خيار خاطئ'),blocks.join('\n\n').replace('*الخيار الصحيح','*'),blocks.join('\n\n').replace('خيار آخر','خيار خاطئ')]) assert.throws(()=>parseBulkQuestions(raw));
});
test('reject non-text and oversized input',()=>{
    assert.throws(()=>parseBulkQuestions({}));assert.throws(()=>parseBulkQuestions('x'.repeat(50001)));
});
test('schedule 24-hour answers, 24-hour breaks, same Riyadh time across month boundary',()=>{
    const start=new Date('2027-02-08T21:00:00+03:00');
    const schedule=bulkSchedule(start),day=86400000;
    assert.equal(schedule.length,15);
    for(let i=0;i<15;i++){
        assert.equal(schedule[i].opensAt.getTime(),start.getTime()+i*2*day);
        assert.equal(schedule[i].closesAt-schedule[i].opensAt,day);
        if(i>0)assert.equal(schedule[i].opensAt-schedule[i-1].closesAt,day);
        assert.equal(schedule[i].opensAt.getUTCHours(),18);
    }
    assert.equal(schedule[14].opensAt-start,28*day);
    assert.equal(schedule[14].closesAt-start,29*day);
});
