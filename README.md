# cypress-circleci-reporter

Cypress test reporter for CircleCI

## Installation

```shell
$ npm install cypress-circleci-reporter --save-dev
```

## Usage

```
run_cypress_tests:
  parallelism: 3
  steps:
    [...]
    - run:
        name: Run cypress tests
        command: |
          yarn cypress run --spec "$(circleci tests glob "./cypress/integration/**/*.spec.ts" | circleci tests split --split-by=timings | paste -sd "," -)"

    - store_test_results:
        path: test_results
    - store_artifacts:
        path: test_results
    - store_artifacts:
        path: ~/repo/cypress/videos
    - store_artifacts:
        path: ~/repo/cypress/screenshots
```

### Configuration options

| Parameter      | Default                  | Effect                                                                                                                                                                          |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| project        | `undefined`              | If you use Cypress' `project` parameter, this should be set to the same value.                                                                                                  |
| resultsDir     | `./test_results/cypress` | Name of the directory that reports will be saved into. report                                                                                                                   |
| resultFileName | `cypress-[hash]`         | Name of the file that will be created for each test run. Must include `[hash]` string as each spec file is processed completely separately during each `cypress run` execution. |
