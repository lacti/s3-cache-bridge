export default function splitByDelimiter(data: string, delim: string) {
  const pos = data.indexOf(delim);
  return pos > 0 ? [data.substr(0, pos), data.substr(pos + 1)] : ["", ""];
}
