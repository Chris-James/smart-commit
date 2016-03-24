# Smart Commit
[![Build Status](https://travis-ci.org/Chris-James/smart-commit.svg?branch=master)](https://travis-ci.org/Chris-James/smart-commit)

## Introduction
__Smart Commit__ is an adapter for [__Commitizen__](https://www.npmjs.com/package/commitizen).  

Commitizen is a command line utility that formats Git commit messages by prompting the committer with questions.  

## Setup

In order to use Smart Commit you must:
* Install Commitizen globally.
* Initialize Commitizen & the Smart Commit adapter in your repo.

First, install Commitizen globally.
```bash
npm install -g commitizen
```

Next, navigate into your project's directory and initialize Commitizen.  
```bash
commitizen init smart-commit --save --save-exact
```

This command installs the smart-commit adapter, saves it to your `package.json` dependencies or devDependencies, and adds the `config.commitizen` key:
```JSON
...
  "config": {
    "commitizen": {
      "path": "node_modules/smart-commit"
    }
  }
```

Any developers (using Commitizen) that contribute to this repo will be shown the Smart Commit prompt.

## Usage

1. Type `git cz` instead of `git commit` when committing.
1. Follow the instructions in the prompt.
1. Review your formatted commit message and choose to **commit**, **edit**, or **cancel**.

> Choosing to edit your commit will open your formatted commit message in your default EDITOR.

## Commit Message Format

A commit message consists of three components:  
- **Header** - The commit type, scope, & subject
- **Body** - A more detailed description of the changes being committed
- **Footer** - Breaking changes, issues closed, programming partners

Commit messages are, generally, formatted as follows:
```
<type> <scope>: <Subject>

<body>

BREAKING-CHANGE:

<description>

CLOSES: <issue>
PAIRED-WITH: <Name>, ...
```

### Header

The header includes the commit's **type**, **scope**, and **subject**.  

It _must_ be less than 69 characters in length.


#### Type

The type can only be one of the following:

```
feature     A new feature.
fix         A bug fix.
docs        A change to documentation or comments only.
style       A change that does not affect the meaning of the code (white-space, alignment, etc).
refactor    A change that neither fixes a bug nor adds a feature.
tune        A change that improves performance.
test        Add test(s).
chore       A change to the build process, auxiliary tools, libraries, etc.
```

#### Scope

The commit's scope specifies the location of the changes. This could be a filename, function
name, or some other identifier for the general area of the code being modified.

#### Subject

The commit's subject is a succinct description of the changes being committed.

It should
* Be <= 50 characters long
* Use the imperative, present tense (ie. "Change" not "Changed" nor "Changes").

A subject **should not include a period (.)** at the end.

> #### Subject Length  
> Keeping subject lines at this length ensures that they are readable, and forces the author to think for a moment about the most concise way to explain what's going on.  
>
> Tip: If you're having a hard time summarizing, you might be committing too many changes at once.  

> #### Subject Tense  
> Imperative means "spoken or written as if giving a command or instruction".  
>
> A few examples:  
> * Clean the garage
> * Close the door  
> * Take out the trash  
>
> A properly formed Git commit subject line should always be able to complete the following sentence:  
>
> If applied, this commit will _your subject here_.
>
>[chris.beams.io](http://chris.beams.io/posts/git-commit/)

#### Example Headers
`docs README.md: Add setup instructions`

`style userDashboard.js: Replace tabs with soft tabs (2 spaces)`

`feat login(): Implement validation for login credentials`

---
### Body

The body is a detailed description of the change(s) being committed.  

It should:  
* Explain the problem that the change tries to solve (i.e., What is wrong with the current code without the change?).
* Justify the way the change solves the problem (i.e., Why the result with the change is better).
* List alternate solutions considered but discarded, if any.

#### Example Bodies

```
The such-and-such in so-and-so file was returning data that was
yada-yada-yada. This caused the fizz in buzz to woof.

This implements bingbang in such-and-such function in order to ensure
the data returned is bongo.
```

```
The blerg check in fleepflorp had an off by 1 error. This would cause
it to access uninitialized memory if it was the last argument.

Adding a fingle causes blerg to display an error message and the usage
string instead.
```

---
### Footer

The message footer includes three optional components:
- breaking changes introduced by the commit
- issues closed by the commit
- pair programming partners

#### Example Footer

```
BREAKING-CHANGES:

Templates are now case-sensitive and use camelCase instead of kebab-case (dash-case).

CLOSES: 276
PAIRED-WITH: Jeremy Reston
```
