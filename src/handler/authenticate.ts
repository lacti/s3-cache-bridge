import { verify } from "jsonwebtoken";
import { auth } from "../env";
import splitByDelimiter from "../utils/splitByDelimiter";

export default function authenticate(authorization: string) {
  const [type, token] = splitByDelimiter(authorization, " ");
  switch (type) {
    case "Basic":
      const [id, password] = splitByDelimiter(
        Buffer.from(token, "base64")
          .toString("utf8")
          .trim(),
        ":"
      );
      if (id !== auth.authId && password !== auth.authPassword) {
        throw new Error("Invalid authentication");
      }
      break;
    case "Bearer":
      if (auth.jwtSecretKey === undefined) {
        throw new Error("Invalid JWT");
      }
      verify(token, auth.jwtSecretKey);
      break;
    default:
      throw new Error("Invalid authorization");
  }
}
