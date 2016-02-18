# Smart Commit

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

This command installs the a100-smart-commit adapter, saves it to your `package.json` dependencies or devDependencies, and adds the `config.commitizen` key:
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

Commits are, generally, formatted as follows:
```
<TYPE>(<scope>): <Subject>

<body>

Driver: <Name>
Navigator(s): <Name>, ...
```

A commit message consists of a **header**, **body**, and a **footer**.  

### Header

The header includes the **type**, **scope**, and **subject** of the commit.
```
<TYPE>(<scope>): <Subject>
```
It _must_ be less than 69 characters in length.


#### Type

Commit type can only be one of the following:

```
FEAT:   A new feature.
FIX:    A bug fix.
DOCS:   Changes to documentation only.
STYLE:  Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
REFACT: A code change that neither fixes a bug nor adds a feature.
PERF:   A code change that improves performance.
TEST:   Adding missing tests.
REM:    Remove file(s), function(s), etc from the codebase.
```

#### Scope

The scope of a commit specifies the location or target of the changes. This could be a filename, function
name, or some other identifier for the general area of the code being modified.

#### Subject

The subject contains a succinct description of the changes being committed. It is not included for commits of type _REM_.  

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
> * Clean your room  
> * Close the door  
> * Take out the trash  
>
> A properly formed git commit subject line should always be able to complete the following sentence:  
>
> If applied, this commit will _your subject here_.
>
>[chris.beams.io](http://chris.beams.io/posts/git-commit/)

#### Example Headers
```
DOCS(readme): Add setup instructions to README

STYLE(userDashboard): Replace tabs with soft tabs (2 spaces)

FEAT(login): Implement validation for login credentials

REM: foo.js
```
---
### Body

The body is a detailed description of the change(s) being committed. It should:  
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

The footer is optional. It is included if the work being committed was completed during a pair programming session.

It specifies the name of the _driver_ and the name(s) of any _navigators_.

#### Example Footer
```
Driver: Julio Mansilla
Navigator(s): Krishna Sampath, Derek Koch, Heriberto Roman
```
