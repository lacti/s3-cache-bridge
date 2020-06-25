import IRouteEvent from "./routeEvent";
import Response from "./response";
import deleteFile from "./api/deleteFile";
import getFile from "./api/getFile";
import patchJSONFile from "./api/patchJSONFile";
import putFile from "./api/putFile";
import updateFileState from "./api/updateFileState";

const routes: {
  [method: string]: (event: IRouteEvent) => Promise<Response<unknown> | void>;
} = {
  GET: getFile,
  PUT: putFile,
  DELETE: deleteFile,
  POST: updateFileState,
  PATCH: patchJSONFile,
};

export default routes;
