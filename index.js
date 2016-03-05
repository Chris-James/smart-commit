"format cjs";

var wrap = require('word-wrap');
var Log = require('log');
var editor = require('editor');
var temp = require('temp').track();
var fs = require('fs');

var log = new Log('info');

module.exports = {
  trim: trim,
  buildBody: buildBody,
  lengthError: lengthError,
  calculateOverflow: calculateOverflow,
  validateLength: validateLength,
  concat: concat,

  // By default, we'll de-indent your commit template & will keep empty lines.
  prompter: function(cz, commit) {

    /**
     * @function prompter
     * Defines the questions asked, gather answers from user, formats commit message, executes git commit.
     * Uses inquirer.js for Q&A - see docs for specifics.

     * @param {Object} cz - an instance of inquirer.js. Executed when user runs 'git cz'.
     * @param {Function} commit - callback. Argument is commit message that will be passed to Git.
    **/

    cz.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select the type of change that you\'re committing:',
        choices: [
        {
          name: 'feat:     A new feature',
          value: 'feat'
        }, {
          name: 'fix:      A bug fix',
          value: 'fix'
        }, {
          name: 'docs:     Change to documentation or comments only.',
          value: 'docs'
        }, {
          name: 'style:    Change that does not affect the meaning of the code\n            (white-space, alignment, formatting, etc)',
          value: 'style'
        }, {
          name: 'refactor: Code change that neither fixes a bug nor adds a feature',
          value: 'ref'
        }, {
          name: 'perf:     Code change that improves performance',
          value: 'perf'
        }, {
          name: 'test:     Add test(s)',
          value: 'test'
        }, {
          name: 'remove:   Remove file(s), function(s), etc from the codebase',
          value: 'rem'
        }, {
          name: 'chore:    Change to the build process, auxiliary tools, libraries, etc',
          value: 'chore'
        }]
      }, {
        type: 'input',
        name: 'scope',
        message: 'Denote the location of this change: ',
        when: function(answerObj) {
          return answerObj.type !== 'rem';
        },
        filter: function(scope) {
          return trim(scope);
        }
      }, {
        type: 'input',
        name: 'target',
        message: 'What are you removing?',
        when: function(answerObj) {
          return answerObj.type === 'rem';
        },
        validate: function(target) {
          var answers = arguments[1];
          return validateLength(target, answers);
        },
        filter: function(target) {
          return trim(target);
        }
      }, {
        type: 'input',
        name: 'subject',
        message: 'Write a short, imperative tense description of the change: ',
        when: function(answerObj) {
          return answerObj.type !== 'rem';
        },
        validate: function(subject) {
          var answers = arguments[1];
          return validateLength(subject, answers);
        },
        filter: function(subject) {
          return trim(subject);
        }
      }, {
        type: 'input',
        name: 'body',
        message: 'Provide a longer description of the change. Use "|" to add a line break.\n',
        filter: function(body) {
          return trim(body);
        }
      }, {
        type: 'confirm',
        name: 'close',
        message: 'Does this commit close an issue?',
      }, {
        type: 'input',
        name: 'issue',
        message: 'Closes Issue #: ',
        when: function(answerObj) {
          return (!!answerObj.close)
        },
        filter: function(issue) {
          return trim(issue);
        }
      }, {
        type: 'confirm',
        name: 'pair',
        message: 'Did you pair with anyone?',
        when: function(answerObj) {
          return answerObj.type !== 'rem';
        }
      }, {
        type: 'input',
        name: 'driver',
        message: 'Driver: ',
        when: function(answerObj) {
          return !!answerObj.pair;
        },
        filter: function(driver) {
          return trim(driver);
        }
      }, {
        type: 'input',
        name: 'navs',
        message: 'Navigator(s): ',
        when: function(answerObj) {
          return !!answerObj.pair;
        },
        filter: function(navs) {
          return trim(navs);
        }
      }, {
        type: 'list',
        name: 'confirm',
        message: function(answerObj) {
          var commitMessage = buildCommitMessage(answerObj);

          return 'Here is your commit message:\n\n' + commitMessage + '\n\n' + 'How would you like to proceed?';
        },
        choices: [
          { name: 'Commit', value: 'commit'},
          { name: 'Edit Message', value: 'edit'},
          { name: 'Cancel Commit', value: 'cancel'}
        ]
      }
    ], function(answers) {

      var commitMessage = buildCommitMessage(answers);

      switch(answers.confirm) {
        case 'commit':
          commit(commitMessage);
          break;
        case 'cancel':
          log.warning('Commit cancelled.');
          break;
        case 'edit':
          temp.open(null, function(err, info) {
            var error = !!err;
            if (!error) {
              fs.write(info.fd, commitMessage);
              fs.close(info.fd, function(err) {
                editor(info.path, function (code, sig) {
                  var success = 0;
                  if (code === success) {
                    var newCommitMessage = fs.readFileSync(info.path, { encoding: 'utf8' });
                    commit(newCommitMessage);
                  } else {
                    log.info('Editor returned error. Commit message was:\n' + commitMessage);
                  }
                });
              });
            }
          });
          break;
        default:
          break;
      }
    });
  }
}

function buildBody(input) {

  /**
   * @function buildBody
   * Returns properly formatted body for commit message.

   * @param {String} input
   * @return {String} body
  **/

  // Default to empty string in case of undefined input
  var bodyInput = input || '';
  var statements;
  var body = '';

  var wrapOptions = {
    trim: true,
    newline: '\n',
    indent:'',
    width: 72
  };

  // Split the body into discrete chunks
  statements = bodyInput.split('|');

  statements.forEach(function(item) {

    // Wrap then concatenate each chunk
    body += wrap(item, wrapOptions);
    body = concat(body, '\n', 1);

  });

  // Remove trailing '\n'
  return body.slice(0,-1);

}

function buildCommitMessage(answers) {

  /**
   * @function buildCommitMessage
   * Returns properly formatted commit mesage.

   * @param {Object} answers
   * @return {String} commitMessage
  **/

  // Header Vars
  var type = answers.type;
  var scope = answers.scope;
  var subject = answers.subject || '';
  var target = answers.target || '';
  var delimiter = ': ';

  var body = answers.body;

  // Footer Vars
  var pair = answers.pair;
  var driver = answers.driver;
  var navs = answers.navs;
  var close = answers.close;
  var issueNum = answers.issue;

  var head;
  var commitMessage;

  // Construct header
  scope = (!!scope) ? '(' + scope + ')' : '';
  head = (type + scope + delimiter + subject + target);

  // Format commit header
  commitMessage = head;

  // Format commit body
  if (!!body) {
    commitMessage += '\n';
    commitMessage += '\n';
    commitMessage += buildBody(body);
  }

  // Format commit footer
  if (!!pair) {
    commitMessage += '\n';
    commitMessage += '\n';
    commitMessage += 'Driver: ' + driver;
    commitMessage += '\n';
    commitMessage += 'Navigator(s): ' + navs;
  }

  if (!!close) {
    commitMessage += '\n';
    commitMessage += '\n';
    commitMessage += 'Closes: ' + issueNum;
  }

  return commitMessage;
}

function concat(target, string, count) {
  /**
   * @function concat
   * Appends <string> to <target> <count> times.

   * @param {String} target
   * @param {String} string
   * @param {Number} count
   * @return {String} target
  **/
  while (count) {
    target += string;
    count--;
  }
  return target;
}

function validateLength(subject, answerObj) {

  /**
   * @function validateLength
   * Uses calculateOverflow() to determine if length of input is <= 69 chars.
   * If so, returns true.
   * If not, passes the number of chars overflow into lengthError() and returns the error message generated.

   * @param {String} subject
   * @param {Object} answerObj
   * @returns {String | Boolean} error message or true
  **/

  var HEADER_LIMIT = 69;

  var subjectLength = subject.length;
  var typeLength = answerObj.type.length;
  var scopeLength = (!!answerObj.scope) ? (answerObj.scope.length + 2) : 0;    // +2 for the parentheses
  var delimiterLength = 2;  // +2 for ": "

  // calculateOverflow will return how many characters beyond the HEADER_LIMIT or false
  var overflow = calculateOverflow(subjectLength, typeLength, scopeLength, delimiterLength, HEADER_LIMIT);

  return (!!overflow) ? lengthError(overflow) : true;
}

function calculateOverflow(subjectLength, typeLength, scopeLength, delimiterLength, LIMIT) {

  /**
   * @function calculateOverflow
   * Used to validate the length of the complete, formatted commit header.
   * Length is valid if it is <= the limit specified by LIMIT.

   * @param {Number} subjectLength
   * @param {Number} typeLength
   * @param {Number} scopeLength
   * @param {Number} delimiterLength
   * @param {Number} LIMIT

   * @returns {Number | Boolean} number of characters past 69 or false
  **/

  var charsRemainingForSubject = (LIMIT - (typeLength + scopeLength + delimiterLength));
  var overflow = (subjectLength > charsRemainingForSubject);
  var totalCharsOver = (subjectLength - charsRemainingForSubject);
  var noOverflow = false;

  return (overflow)? totalCharsOver : noOverflow;
}

function lengthError(overflowAmount) {

  /**
   * @function lengthError
   * Only called when a commit header is longer than the specified LIMIT.
   * Uses the amount of chars of overflow to created a properly formatted error message.

   * @param {Number} overflowAmount
   * @returns {String} formatted error message
  **/

  var plural = (overflowAmount > 1) ? 's' : '';
  return 'Message was ' + overflowAmount + ' character' + plural + ' too long.';
}

function trim(input) {

  /**
   * @function trim
   * Removes leading and trailing whitespace from input.

   * @param {String} input
   * @returns {String} input
  **/

  return input.trim();

}
