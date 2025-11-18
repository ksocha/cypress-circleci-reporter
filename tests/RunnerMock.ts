import { Runner, Suite, Test } from "mocha";

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
  start = () => {
    this.emit(EVENT_RUN_BEGIN);
  };

  end = () => {
    this.emit(EVENT_RUN_END);
  };

  startSuite = (suite: Suite) => {
    suite.suites = suite.suites || [];
    suite.tests = suite.tests || [];

    this.emit(EVENT_SUITE_BEGIN, suite);
  };

  pass = (test: Test) => {
    this.emit(EVENT_TEST_PASS, test);
    this.endTest(test);
  };

  fail = (test: Test, reason: unknown) => {
    this.emit(EVENT_TEST_FAIL, test, reason);
    this.endTest(test);
  };

  pending = (test: Test) => {
    this.emit(EVENT_TEST_PENDING, test);
    this.endTest(test);
  };

  endTest = (test: Test) => {
    this.emit(EVENT_TEST_END, test);
  };
}
