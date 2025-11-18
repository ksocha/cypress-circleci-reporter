import { create } from "xmlbuilder2";
import Mocha, { Runner, Test, type MochaOptions } from "mocha";
import createStatsCollector from "mocha/lib/stats-collector";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import stripAnsi from "strip-ansi";

const {
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_SUITE_BEGIN,
} = Runner.constants;

// A subset of invalid characters as defined in http://www.w3.org/TR/xml/#charsets that can occur in e.g. stacktraces
// regex lifted from https://github.com/MylesBorins/xml-sanitizer/ (licensed MIT)
const INVALID_CHARACTERS_REGEX =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007f-\u0084\u0086-\u009f\uD800-\uDFFF\uFDD0-\uFDFF\uFFFF\uC008]/g; // eslint-disable-line no-control-regex

function removeInvalidCharacters(input: string) {
  return input ? input.replace(INVALID_CHARACTERS_REGEX, "") : input;
}

function getClassname(test: Test) {
  let { parent } = test;
  const titles = [];
  while (parent) {
    if (parent.title) {
      titles.unshift(parent.title);
    }
    parent = parent.parent;
  }
  return titles.join(".");
}

class CypressCircleCIReporter extends Mocha.reporters.Base {
  file = "";

  constructor(runner: Runner, options?: MochaOptions) {
    super(runner, options);

    createStatsCollector(runner);
    const projectPath: string | undefined = options?.reporterOptions?.project;
    const resultsDir: string =
      options?.reporterOptions?.resultsDir || "./test_results/cypress";
    const resultFileName: string =
      options?.reporterOptions?.resultFileName || "cypress-[hash]";

    if (resultFileName.indexOf("[hash]") < 0) {
      throw new Error(`resultFileName must contain '[hash]'`);
    }

    const resultFilePath = path.join(resultsDir, `${resultFileName}.xml`);

    const root = create({ version: "1.0", encoding: "UTF-8" }).ele(
      "testsuite",
      {
        name: "cypress",
        timestamp: new Date().toISOString().slice(0, -5),
      },
    );

    runner.on(EVENT_SUITE_BEGIN, (suite) => {
      if (suite.file) {
        this.file = path.join(projectPath || "", suite.file);
      }
    });

    runner.on(EVENT_TEST_PASS, (test) => {
      root.ele("testcase", this.getTestcaseAttributes(test));
    });

    runner.on(EVENT_TEST_FAIL, (test, err) => {
      let message = "";
      if (err.message && typeof err.message.toString === "function") {
        message = String(err.message);
      } else if (typeof err.inspect === "function") {
        message = String(err.inspect());
      }

      const failureMessage = err.stack || message;

      root
        .ele("testcase", this.getTestcaseAttributes(test))
        .ele("failure", {
          message: removeInvalidCharacters(message) || "",
          type: err.name || "",
        })
        .ele({ $: removeInvalidCharacters(failureMessage) });
    });

    runner.on(EVENT_TEST_PENDING, (test) => {
      root.ele("testcase", this.getTestcaseAttributes(test));
    });

    runner.on(EVENT_RUN_END, () => {
      root.att("time", ((runner.stats?.duration || 0) / 1000).toFixed(4));
      root.att("tests", String(runner.stats?.tests || 0));
      root.att("failures", String(runner.stats?.failures || 0));
      root.att("skipped", String(runner.stats?.pending || 0));

      const xmlText = root.end({ prettyPrint: true }).toString();

      const finalPath = resultFilePath.replace(
        "[hash]",
        crypto.createHash("md5").update(xmlText).digest("hex"),
      );

      const finalPathDir = path.dirname(finalPath);

      if (!fs.existsSync(finalPathDir)) {
        fs.mkdirSync(finalPathDir, { recursive: true });
      }
      fs.writeFileSync(finalPath, xmlText, "utf-8");
    });
  }

  private getTestcaseAttributes = (test: Test) => {
    return {
      name: stripAnsi(test.title),
      file: this.file,
      time:
        typeof test.duration === "undefined"
          ? 0
          : (test.duration / 1000).toFixed(4),
      classname: stripAnsi(getClassname(test)),
    };
  };
}

export default CypressCircleCIReporter;
