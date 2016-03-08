var test = require('ava');
var index = require('./index.js');

test('trim()', function(t) {
  t.true(index.trim('test     ') === 'test', 'removes trailing whitespace');
  t.true(index.trim('     test') === 'test', 'removes leading whitespace');
});

test('buildBody()', function(t) {
  t.is(index.buildBody('This is a newline||test.'), 'This is a newline\n\ntest.', 'replaces \'|\' with \'\\n\'.');
  t.is(index.buildBody(undefined), '', 'undefined returns empty string');
  t.not(index.buildBody('test').slice(-1), '\n', 'does not concatenate trailing newline.');
  t.is(index.buildBody(''), '', ' \'\' returns empty string');
  t.is(index.buildBody(null), '', 'null returns empty string')
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
  t.is(index.concat('test', '\n', 1), 'test\n', 'appends one newline');
  t.is(index.concat('test', '\n', 2), 'test\n\n', 'appends two newlines');
});

test('formatHeader()', function(t) {
  t.is(index.formatHeader('fix', 'index', 'Add body', undefined), 'fix(index): Add body', 'handles type, scope, and subject');
  t.is(index.formatHeader('feat', undefined, 'Initial commit', undefined), 'feat: Initial commit', 'handles type and scope');
  t.is(index.formatHeader('rem', undefined, undefined, 'file, file, file'), 'rem: file, file, file', 'handles rem and target');
});

test('buildCommitMessage()', function(t) {
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: false, close: false}), 'feat(index): Add break tag\n\nAdd break tag to body of index.');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: true, driver:'Foob Ar', navs:'Buzz Fizz', close: false}), 'feat(index): Add break tag\n\nAdd break tag to body of index.\n\nDriver: Foob Ar\nNavigator(s): Buzz Fizz');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: false, close: true, issue:'367'}), 'feat(index): Add break tag\n\nAdd break tag to body of index.\n\nCloses: 367');
  t.is(index.buildCommitMessage({type:'feat', scope:'index', subject:'Add break tag', body:'Add break tag to body of index.', pair: true, driver:'Foob Ar', navs:'Buzz Fizz', close: true, issue:'367'}), 'feat(index): Add break tag\n\nAdd break tag to body of index.\n\nCloses: 367\n\nDriver: Foob Ar\nNavigator(s): Buzz Fizz');
});
