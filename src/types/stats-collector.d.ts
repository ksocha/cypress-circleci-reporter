declare module 'mocha/lib/stats-collector' {
  import { Runner } from 'mocha';

  export default function createStatsCollector(runner: Runner): void;
}
