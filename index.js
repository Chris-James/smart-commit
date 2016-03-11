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
  formatHeader: formatHeader,
  buildCommitMessage: buildCommitMessage,

  // By default, we'll de-indent your commit template & will keep empty lines.
  prompter: function(cz, commit) {

    /**
     * @function prompter
     * Defines the questions asked, gather answers from user, formats commit message, executes git commit.
     * Uses inquirer.js for Q&A - see docs for specifics.

     * @param {Object} cz - an instance of inquirer.js. Executed when user runs 'git cz'.
     * @param {Function} commit - callback. The argument is the message that will be passed to Git.
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
          name: 'style:    Change that does not affect the meaning of the code (white-space, alignment, etc)',
          value: 'style'
        }, {
          name: 'refactor: Code change that neither fixes a bug nor adds a feature',
          value: 'ref'
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
        name: 'break',
        message: 'Does this commit introduce a breaking change?'
      }, {
        type: 'input',
        name: 'breakingChange',
        message: 'Provide a longer description of the breaking changes. Use "|" to add a line breaks.\n',
        filter: function(change) {
          return trim(change);
        },
        when: function(answerObj) {
          return (!!answerObj.break)
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
      },{
        type: 'input',
        name: 'navs',
        message: 'List the people you paired with: ',
        when: function(answerObj) {
          return (!!answerObj.pair);
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

  if (!!bodyInput) {

    body += concat('\n', 2);

    // Split the body into discrete chunks
    statements = bodyInput.split('|');

    statements.forEach(function(item) {

      // Wrap then concatenate each chunk
      body += wrap(item, wrapOptions);
      body += concat('\n', 1);
    });

  }

  return (!!body) ? body.slice(0,-1) : body;

}

function buildCommitMessage(answers) {

  /**
   * @function buildCommitMessage
   * Returns properly formatted commit mesage.

   * @param {Object} answers
   * @return {String} commitMessage
  **/

  // Header Vars
  var header = {
    type: answers.type,
    scope: answers.scope,
    subject: answers.subject,
    // target: answers.target
  };

  var body = answers.body;

  // Footer Vars
  var footer = {
    break: answers.break,
    change: answers.breakingChange,
    pair: answers.pair,
    driver: answers.driver,
    navs: answers.navs,
    close: answers.close,
    issue: answers.issue
  };

  var head;
  var commitMessage = '';

  commitMessage += formatHeader(header);
  commitMessage += buildBody(body);
  commitMessage += formatFooter(footer);

  return commitMessage;

}

function formatFooter(footerObj) {

  /**
   * @function commitFooter

   * @param {Object} footerObj
   * @return {String} footer
  **/

  var breaks = footerObj.break;
  var footer = '\n\n';

  if (!!breaks) {
    footer += 'breaking-change: ' + footerObj.change;
    footer += concat('\n', 2);
  }

  if (!!footerObj.close) {
    footer += 'closes: ' + footerObj.issue;
    footer += concat('\n', 1);
  }

  if (!!footerObj.pair) {
    footer += 'paired-with: ' + footerObj.navs;
  }

  return footer;
}

function formatHeader(headerObj) {

  /**
   * @function formatHeader
   * Returns a properly formatted commit header.

   * @param {Object} headerObj
   * @return {String} header
  **/

  var type = headerObj.type || '';
  var scope = headerObj.scope || '';
  var subject = headerObj.subject || '';
  var target = headerObj.target || '';

  var header = '';

  scope = (!!scope) ? '(' + scope + ')' : '';
  header += (type + scope + ': ' + subject + target);

  return header;
}


function concat(string, count) {

  /**
   * @function concat
   * Returns a string consisting of <string> <count> times.

   * @param {String} string
   * @param {Number} count
   * @return {String} target
  **/

  var out = '';

  while (count) {
    out += string;
    count--;
  }

  return out;
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
