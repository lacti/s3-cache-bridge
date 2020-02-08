export default function trimStartSlash(key: string) {
  while (key.startsWith("/")) {
    key = key.substring(1);
  }
  return key;
}
