import sleep from "./sleep";

export type RunningHandle = ReturnType<typeof runningHandle>;

export default function runningHandle(initial: boolean) {
  let value = initial;
  return {
    value: () => value,
    update: (newValue: boolean) => (value = newValue),
    sleep: async (millis: number) => {
      const smallSleep = 1000;
      const end = Date.now() + millis;
      while (value && end > Date.now()) {
        await sleep(smallSleep);
      }
    }
  };
}
