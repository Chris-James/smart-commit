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
