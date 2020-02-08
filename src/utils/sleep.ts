export default function sleep(millis: number) {
  return new Promise<void>(resolve => setTimeout(resolve, millis));
}
