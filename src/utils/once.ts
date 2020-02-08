export default function once<R>(work: () => R) {
  let done = false;
  return (): R | undefined => {
    if (done) {
      return;
    }
    done = true;
    return work();
  };
}
