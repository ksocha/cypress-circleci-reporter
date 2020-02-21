import 'jest-xml-matcher';
import { advanceTo } from 'jest-date-mock';
import { Suite, Test } from 'mocha';
import fs from 'fs';

import RunnerMock from './RunnerMock';
import CypressCircleCIReporter from '../src';

describe('reporter', () => {
  const now = new Date();
  const nowISO = now.toISOString().slice(0, -5);
  advanceTo(now);

  beforeEach(() => {
    fs.rmdirSync(`./test_results/cypress`, { recursive: true });
  });

  it('creates proper xml for test run', () => {
    const testFile = 'path/to/file.spec.ts';

    const test1 = new Test('test1');
    test1.duration = 1200;

    const test2 = new Test('test2');
    test2.duration = 2500;

    const test3 = new Test('test3');
    test3.duration = 3500;

    const test4 = new Test('test4');
    test4.duration = 1500;

    const suite = new Suite('root');
    suite.tests = [test1, test2, test3, test4];
    suite.root = true;
    suite.file = testFile;

    test1.parent = suite;
    test2.parent = suite;
    test3.parent = suite;
    test4.parent = suite;

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

    runnerMock.end();
    const files = fs.readdirSync('./test_results/cypress');
    const actualXML = fs.readFileSync(
      `./test_results/cypress/${files[0]}`,
      'utf-8'
    );
    const expectedXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <testsuite name="cypress" timestamp="${nowISO}" time="0.0000" tests="4" failures="2" skipped="1">
        <testcase name="${test1.title}" file="${testFile}" time="1.2000" classname="root"/>
        <testcase name="${test2.title}" file="${testFile}" time="2.5000" classname="root">
          <failure message="some test message" type="TestError">
            <![CDATA[some test message]]>
          </failure>
        </testcase>
        <testcase name="${test3.title}" file="${testFile}" time="3.5000" classname="root">
          <failure message="" type="">
            <![CDATA[some test stack]]>
          </failure>
        </testcase>
      </testsuite>`;

    expect(actualXML).toEqualXML(expectedXML);
  });

  it('creates proper xml with project path passed', () => {
    const testFile = 'path/to/file.spec.ts';

    const test1 = new Test('test1');
    test1.duration = 1200;

    const suite = new Suite('root');
    suite.tests = [test1];
    suite.root = true;
    suite.file = testFile;

    test1.parent = suite;

    const runnerMock = new RunnerMock(suite, false);
    new CypressCircleCIReporter(runnerMock, {
      reporterOptions: { project: 'spec' },
    });

    runnerMock.start();
    runnerMock.startSuite(suite);

    runnerMock.pass(test1);

    runnerMock.end();
    const files = fs.readdirSync('./test_results/cypress');
    const actualXML = fs.readFileSync(
      `./test_results/cypress/${files[0]}`,
      'utf-8'
    );
    const expectedXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <testsuite name="cypress" timestamp="${nowISO}" time="0.0000" tests="1" failures="0" skipped="0">
        <testcase name="${test1.title}" file="spec/${testFile}" time="1.2000" classname="root"/>
      </testsuite>`;

    expect(actualXML).toEqualXML(expectedXML);
  });
});
