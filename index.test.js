var test = require('ava');
var index = require('./index.js');

test('trim()', function(t) {
  t.true(index.trim('test     ') === 'test', 'removes trailing whitespace');
  t.true(index.trim('     test') === 'test', 'removes leading whitespace');
});

test('buildBody()', function(t) {
  t.is(index.buildBody('This is a newline||test.'), 'This is a newline\n\ntest.', 'replaces \'|\' with \'\\n\'.');
  t.is(index.buildBody(undefined), '', 'handles undefined.');
  t.not(index.buildBody('test').slice(-1), '\n', 'does not concatenate trailing newline.');
});

test('lengthError()', function(t) {
  t.is(index.lengthError(1), 'Message was 1 character too long.', 'returns singular.');
  t.is(index.lengthError(2), 'Message was 2 characters too long.', 'returns plural.');
  t.is(index.lengthError(45), 'Message was 45 characters too long.', 'returns large plural.');
});
