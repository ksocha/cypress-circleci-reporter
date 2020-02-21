import { Runner, Suite, Test } from 'mocha';

const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
  EVENT_TEST_END,
} = Runner.constants;

export default class RunnerMock extends Runner {
  constructor(suite: Suite, delay: boolean) {
    super(suite, delay);
  }

  start = () => {
    this.emit(EVENT_RUN_BEGIN);
  };

  end = () => {
    this.emit(EVENT_RUN_END);
  };

  startSuite = (suite: Suite) => {
    suite.suites = suite.suites || [];
    suite.tests = suite.tests || [];

    // if (this._currentSuite) {
    //   suite.parent = this._currentSuite;
    // }

    // this._currentSuite = suite;
    this.emit(EVENT_SUITE_BEGIN, suite);
  };

  pass = (test: Test) => {
    this.emit(EVENT_TEST_PASS, test);
    this.endTest();
  };

  fail = (test: Test, reason: any) => {
    this.emit(EVENT_TEST_FAIL, test, reason);
    this.endTest();
  };

  pending = (test: Test) => {
    this.emit(EVENT_TEST_PENDING, test);
    this.endTest();
  };

  endTest = () => {
    this.emit(EVENT_TEST_END);
  };
}
