# cypress-circleci-reporter

![CircleCI](https://img.shields.io/circleci/build/github/ksocha/cypress-circleci-reporter?style=flat-square)
![npm](https://img.shields.io/npm/v/cypress-circleci-reporter?style=flat-square)
![GitHub](https://img.shields.io/github/license/ksocha/cypress-circleci-reporter?style=flat-square)

Cypress test reporter for CircleCI based on [mocha-junit-reporter](https://github.com/michaelleeallen/mocha-junit-reporter). Helps with test parallelization.

This is Share911's fork of [ksocha/cypress-circleci-reporter](https://github.com/ksocha/cypress-circleci-reporter), published as `@share911/cypress-circleci-reporter`. See the [Changelog](#changelog) below.


## Requirements

- Cypress 3.8.3 or newer

## Installation

```shell
$ npm install cypress-circleci-reporter mocha --save-dev
```

```shell
$ yarn add cypress-circleci-reporter mocha --dev
```

## Usage

After installing the reporter, you'll need to modify your config to use it:

### CircleCI config example

```
run_cypress_tests:
  parallelism: 3        # or any other number that suits your needs
  steps:
    # some previous steps

    - run:
        name: Run cypress tests
        command: yarn cypress run --spec "$(circleci tests glob "./cypress/e2e/**/*.cy.js" | circleci tests split --split-by=timings | paste -sd "," -)" --reporter cypress-circleci-reporter

    - store_test_results:
        path: test_results
    - store_artifacts:
        path: test_results
```

First test run with this config should create and store reports for each test file. These will be used during next runs to determine timings of each test. CircleCI will then split the test files between available containers to speed up the process.

### Configuration options

Options can be passed to the reported by adding `--reporter-options` parameter to the CLI command.

Example: `--reporter cypress-circleci-reporter --reporter-options "resultsDir=./results/cypress,resultFileName=result-[hash]"`

| Parameter      | Default                  | Effect                                                                                                                                                                          |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| project        | `undefined`              | If you use Cypress' `project` parameter, this should be set to the same value.                                                                                                  |
| resultsDir     | `./test_results/cypress` | Name of the directory that reports will be saved into.                                                                                                                          |
| resultFileName | `cypress-[hash]`         | Name of the file that will be created for each test run. Must include `[hash]` string as each spec file is processed completely separately during each `cypress run` execution. |
| consoleOutput  | `true`                   | When enabled, prints test names and results to stdout as they run, including a summary of passing, failing, and pending tests.                                                  |

## Changelog

### 0.5.3

- Record measured wall time for tests that have no duration. Cypress reports no duration for
  some failures (e.g. command timeouts), and these were written as `time="0"`. CircleCI's
  `--split-by=timings` then treats those spec files as free and stacks all of them on one
  container, badly unbalancing parallel runs. The reporter now falls back to wall time measured
  since the test began (or the previous test ended) whenever a test has no duration.

### 0.5.2

- Republish of 0.5.1 under a version bump that was not committed back to this repo. No reporter
  code changes.

### 0.5.1

- First release published as `@share911/cypress-circleci-reporter`, forked from
  [ksocha/cypress-circleci-reporter](https://github.com/ksocha/cypress-circleci-reporter) after
  its 0.5.0 release.
- Replaced the `strip-ansi` dependency with Node's built-in `util.stripVTControlCharacters`.

### 0.5.0 and earlier (upstream `cypress-circleci-reporter`)

- 0.5.0 added the `consoleOutput` option (test names, results, and a run summary printed to
  stdout) and updated dependencies.
- For older versions, see the [upstream releases page](https://github.com/ksocha/cypress-circleci-reporter/releases).
