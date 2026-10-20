import test from 'node:test';
import assert from 'node:assert/strict';
import { roundState, competitionLive, parseRiyadh, riyadhInput } from '../src/lib/ramadan.ts';

const opensAt = '2027-02-08T15:00:00Z';
const closesAt = '2027-02-08T16:00:00Z';
const round = { opensAt, closesAt, manuallyClosed: false, resultsPublished: false };
const start = Date.parse(opensAt), end = Date.parse(closesAt);
test('opening is inclusive and closing is exclusive', () => {
    assert.equal(roundState(round,start-1),'upcoming');
    assert.equal(roundState(round,start),'open');
    assert.equal(roundState(round,end-1),'open');
    assert.equal(roundState(round,end),'closed');
});
test('manual close overrides a scheduled open and publication is final', () => {
    assert.equal(roundState({...round,manuallyClosed:true},start),'closed');
    assert.equal(roundState({...round,resultsPublished:true},start),'results');
});
test('visibility requires both enabling and reaching its independent time', () => {
    assert.equal(competitionLive({enabled:false,visibleAt:opensAt},end),false);
    assert.equal(competitionLive({enabled:true,visibleAt:opensAt},start-1),false);
    assert.equal(competitionLive({enabled:true,visibleAt:opensAt},start),true);
});
test('Riyadh input is UTC+3 regardless of host timezone', () => {
    assert.equal(parseRiyadh('2027-02-08T18:00').getTime(),start);
    assert.equal(riyadhInput(opensAt),'2027-02-08T18:00');
});
test('reject malformed and impossible schedule dates', () => {
    for (const value of ['', '2027-02-30T18:00','2027-13-01T18:00','2027-02-08T24:30','2027-02-08T18:00Z']) assert.throws(()=>parseRiyadh(value));
});

test('X rule accepts legacy username and profile-link forms', async () => {
    const { extractRamadanXHandle: handle } = await import('../src/lib/ramadan-x.ts');
    for (const value of ['family_test', '@family_test', 'https://x.com/family_test', 'twitter.com/family_test?lang=ar']) assert.equal(handle(value),'family_test');
});
test('X rule rejects missing, malformed and reserved names', async () => {
    const { extractRamadanXHandle: handle } = await import('../src/lib/ramadan-x.ts');
    for (const value of [null,undefined,{},'', '@', 'invalid name', 'اسم', '1234567890123456', 'https://example.com/name', 'https://x.com/home']) assert.equal(handle(value),null);
});
