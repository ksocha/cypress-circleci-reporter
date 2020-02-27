import 'jest-xml-matcher';
import { advanceTo, advanceBy } from 'jest-date-mock';
import { Suite, Test } from 'mocha';
import fs from 'fs';

import RunnerMock from './RunnerMock';
import CypressCircleCIReporter from '../src';

function formatDuration(duration: number) {
  return (duration / 1000).toFixed(4);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, -5);
}

describe('reporter', () => {
  beforeEach(() => {
    fs.rmdirSync(`./test_results/cypress`, { recursive: true });
  });

  it('creates proper xml for test run', () => {
    const startDate = new Date();
    const startDateISO = formatDate(startDate);
    advanceTo(startDate);

    const testDuration = 200;
    const testFile = 'path/to/file.spec.ts';

    const test1 = new Test('test1');
    test1.duration = 1200;

    const test2 = new Test('test2');
    test2.duration = 2500;

    const test3 = new Test('test3');
    test3.duration = 3500;

    const test4 = new Test('test4');
    test4.duration = 1500;

    const test5 = new Test('test5');
    test5.duration = 1200;

    const nestedSuite = new Suite('nested');
    nestedSuite.addTest(test5);

    const suite = new Suite('root');
    suite.root = true;
    suite.file = testFile;

    suite.addTest(test1);
    suite.addTest(test2);
    suite.addTest(test3);
    suite.addTest(test4);
    suite.addSuite(nestedSuite);

    const runnerMock = new RunnerMock(suite, false);
    new CypressCircleCIReporter(runnerMock);

    runnerMock.start();
    runnerMock.startSuite(suite);

    runnerMock.pass(test1);
    runnerMock.fail(test2, {
      name: 'TestError',
      message: 'some test message',
    });
    runnerMock.fail(test3, {
      stack: 'some test stack',
    });
    runnerMock.pending(test4);

    runnerMock.startSuite(nestedSuite);
    runnerMock.pass(test5);

    advanceBy(testDuration);

    runnerMock.end();

    const testRunDurationFormatted = formatDuration(testDuration);
    const test1DurationFormatted = formatDuration(test1.duration);
    const test2DurationFormatted = formatDuration(test2.duration);
    const test3DurationFormatted = formatDuration(test3.duration);
    const test5DurationFormatted = formatDuration(test5.duration);

    const files = fs.readdirSync('./test_results/cypress');
    const actualXML = fs.readFileSync(
      `./test_results/cypress/${files[0]}`,
      'utf-8'
    );
    const expectedXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <testsuite name="cypress" timestamp="${startDateISO}" time="${testRunDurationFormatted}" tests="5" failures="2" skipped="1">
        <testcase name="${test1.title}" file="${testFile}" time="${test1DurationFormatted}" classname="root"/>
        <testcase name="${test2.title}" file="${testFile}" time="${test2DurationFormatted}" classname="root">
          <failure message="some test message" type="TestError">
            <![CDATA[some test message]]>
          </failure>
        </testcase>
        <testcase name="${test3.title}" file="${testFile}" time="${test3DurationFormatted}" classname="root">
          <failure message="" type="">
            <![CDATA[some test stack]]>
          </failure>
        </testcase>
        <testcase name="${test5.title}" file="${testFile}" time="${test5DurationFormatted}" classname="root.nested"/>
      </testsuite>`;

    expect(actualXML).toEqualXML(expectedXML);
  });

  it('creates proper xml with project path passed', () => {
    const startDate = new Date();
    const startDateISO = formatDate(startDate);
    advanceTo(startDate);

    const testDuration = 200;
    const testFile = 'path/to/file.spec.ts';

    const test1 = new Test('test1');
    test1.duration = 1200;

    const suite = new Suite('root');
    suite.root = true;
    suite.file = testFile;

    suite.addTest(test1);

    const runnerMock = new RunnerMock(suite, false);
    new CypressCircleCIReporter(runnerMock, {
      reporterOptions: { project: 'spec' },
    });

    runnerMock.start();
    runnerMock.startSuite(suite);

    runnerMock.pass(test1);

    advanceBy(testDuration);

    runnerMock.end();

    const testRunDurationFormatted = formatDuration(testDuration);
    const test1DurationFormatted = formatDuration(test1.duration);

    const files = fs.readdirSync('./test_results/cypress');
    const actualXML = fs.readFileSync(
      `./test_results/cypress/${files[0]}`,
      'utf-8'
    );
    const expectedXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <testsuite name="cypress" timestamp="${startDateISO}" time="${testRunDurationFormatted}" tests="1" failures="0" skipped="0">
        <testcase name="${test1.title}" file="spec/${testFile}" time="${test1DurationFormatted}" classname="root"/>
      </testsuite>`;

    expect(actualXML).toEqualXML(expectedXML);
  });
});
