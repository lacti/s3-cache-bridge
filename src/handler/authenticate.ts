import { verify } from "jsonwebtoken";
import { auth } from "../env";
import splitByDelimiter from "../utils/splitByDelimiter";

const auths: { [type: string]: (token: string) => void } = {
  Basic: basicAuth,
  Bearer: jwtAuth
};

export default function authenticate(authorization: string) {
  const noAuth =
    Object.values(auth).filter(each => each !== undefined).length === 0;
  if (noAuth && authorization.length === 0) {
    return;
  }

  const [type, token] = splitByDelimiter(authorization, " ");
  return (auths[type] ?? invalidAuth)(token);
}

function basicAuth(token: string) {
  const [id, password] = splitByDelimiter(
    Buffer.from(token, "base64")
      .toString("utf8")
      .trim(),
    ":"
  );
  if (id !== auth.authId && password !== auth.authPassword) {
    throw new Error("Invalid authentication");
  }
}

function jwtAuth(token: string) {
  if (auth.jwtSecretKey === undefined) {
    throw new Error("Invalid JWT");
  }
  verify(token, auth.jwtSecretKey);
}

function invalidAuth() {
  throw new Error("Invalid authorization");
}
