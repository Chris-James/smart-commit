var test = require('ava');
var index = require('./index.js');

test('trim() removes leading & trailing whitespace', function(t) {
  t.true(index.trim('test     ') === 'test');
  t.true(index.trim('     test') === 'test');
});
