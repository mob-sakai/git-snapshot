import test from 'ava';

// Basic
test('example', t => {
  t.pass();
});

// Sync
test('sync', async t => {
  const bar = Promise.resolve('bar');

  t.is(await bar, 'bar');
});

// Async
test('async', t => {
  const bar = 'abcd';

  t.is(bar.slice(1), 'bcd');
});

test('pass', t => {
  t.pass(); // 絶対成立
});

test('is/not', t => {
  t.is('abc', 'abc');
  t.not('abc', 'bcd');
});

test('true/false', t => {
  t.true(1 < 2);
  t.false(1 > 2);
});

test('truthy/falsy', t => {
  t.truthy(1);
  t.falsy(0);
});

test('deepEqual', t => {
  t.deepEqual([1, 2, 3], [1, 2, 3]);
  t.notDeepEqual([1, 2, 3], [1, 2, 4]);
});

test('regex/notRegex', t => {
  t.regex('abc', /ab/);
  t.notRegex('abc', /cd/);
});

test.serial('serial 1', async t => {
  const efg = Promise.resolve('efg');
  t.is(await efg, 'efg');
});
test.serial('serial 2', t => {
  t.pass();
});
