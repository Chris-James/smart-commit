var test = require('ava');
var index = require('./index.js');

test('trim()', function(t) {
  t.true(index.trim('test     ') === 'test', 'removes trailing whitespace');
  t.true(index.trim('     test') === 'test', 'removes leading whitespace');
});
