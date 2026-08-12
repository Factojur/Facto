export type SuiteStats = { oks: number; falhas: number };

export function createSuite() {
  let oks = 0;
  let falhas = 0;

  function assert(cond: boolean, msg: string) {
    if (!cond) {
      falhas++;
      console.error(`  FAIL: ${msg}`);
      return;
    }
    oks++;
    console.log(`  OK: ${msg}`);
  }

  return {
    assert,
    stats: (): SuiteStats => ({ oks, falhas }),
  };
}
