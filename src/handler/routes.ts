import Response from "./response";
import RouteEvent from "./routeEvent";
import checkFileExists from "./api/checkFileExists";
import deleteFile from "./api/deleteFile";
import getFile from "./api/getFile";
import patchJSONFile from "./api/patchJSONFile";
import putFile from "./api/putFile";
import updateFileState from "./api/updateFileState";

const routes: {
  [method: string]: (event: RouteEvent) => Promise<Response<unknown> | void>;
} = {
  GET: getFile,
  PUT: putFile,
  DELETE: deleteFile,
  POST: updateFileState,
  PATCH: patchJSONFile,
  HEAD: checkFileExists,
};

export default routes;
