var test = require('ava');
var index = require('./index.js');

test('trim()', function(t) {
  t.true(index.trim('test     ') === 'test', 'removes trailing whitespace');
  t.true(index.trim('     test') === 'test', 'removes leading whitespace');
});

test('formatBody()', function(t) {
  t.is(index.formatBody('This is a newline||test.'), '\n\nThis is a newline\n\ntest.', 'replaces \'|\' with \'\\n\'.');
  t.is(index.formatBody(undefined), '', 'undefined returns empty string');
  t.not(index.formatBody('test').slice(-1), '\n', 'does not concatenate trailing newline.');
  t.is(index.formatBody(''), '', ' \'\' returns empty string');
  t.is(index.formatBody(null), '', 'null returns empty string')
});

test('lengthError()', function(t) {
  t.is(index.lengthError(1), 'Message was 1 character too long.', 'returns singular.');
  t.is(index.lengthError(2), 'Message was 2 characters too long.', 'returns plural.');
  t.is(index.lengthError(45), 'Message was 45 characters too long.', 'returns large plural.');
});

test('calculateOverflow()', function(t) {
  t.is(index.calculateOverflow(10, 10, 10, 2, 69), false, 'returns false when no overflow.');
  t.is(index.calculateOverflow(55, 5, 10, 2, 69), 3, 'returns correct amount when overflow.');
  t.is(index.calculateOverflow(52, 5, 10, 2, 69), false, 'returns false with exactly 69 characters.');
});

test('validateLength()', function(t) {
  t.is(index.validateLength('13 char input', {type: 'feat', scope:'index'}), true, 'returns true for valid length');
  t.is(index.validateLength('This sentence simulates an input message that will not pass validation.', {type: 'ref', scope:'func'}), 'Message was 13 characters too long.', 'returns error for invalid length');
  t.is(index.validateLength('13 char input', {type: 'feat', scope:''}), true, 'handles empty scope');
});

test('concat()', function(t) {
  t.is(index.concat('\n', 1), '\n', 'returns one newline');
  t.is(index.concat('\n', 2), '\n\n', 'returns two newlines');
});

test('formatHeader()', function(t) {
  t.is(index.formatHeader({type: 'ref', scope: 'index.c', subject: 'Remove foo from bar()'}), 'ref index.c: Remove foo from bar()', 'formats header');
  t.is(index.formatHeader({type: 'feat', scope: undefined, subject: 'Initial commit'}), 'feat: Initial commit', 'formats header with undefined scope');
  t.is(index.formatHeader({type: 'ref', scope: 'index.c', subject: undefined}), 'ref index.c', 'formats header with undefined subject');
});

test('buildCommitMessage()', function(t) {
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: false, close: false}), 'feat index: Add break tag\n\nAdd break tag to body of index.\n\n');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: true, navs:'Buzz Fizz', close: false}), 'feat index: Add break tag\n\nAdd break tag to body of index.\n\nPAIRED-WITH: Buzz Fizz');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', break: true, breakingChange: 'This commit introduces a breaking change.', pair: false, close: false}), 'feat index: Add break tag\n\nAdd break tag to body of index.\n\nBREAKING-CHANGE:\n\nThis commit introduces a breaking change.\n\n');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: false, close: true, issue:'367'}), 'feat index: Add break tag\n\nAdd break tag to body of index.\n\nCLOSES: 367\n');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', break: true, breakingChange: 'This commit introduces a breaking change.', pair: true, navs:'Buzz Fizz', close: true, issue:'367'}), 'feat index: Add break tag\n\nAdd break tag to body of index.\n\nBREAKING-CHANGE:\n\nThis commit introduces a breaking change.\n\nCLOSES: 367\nPAIRED-WITH: Buzz Fizz');
});
