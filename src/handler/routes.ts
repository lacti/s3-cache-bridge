import deleteFile from "./api/deleteFile";
import getFile from "./api/getFile";
import putFile from "./api/putFile";
import IRouteEvent from "./routeEvent";

const routes: { [method: string]: (event: IRouteEvent) => Promise<any> } = {
  GET: getFile,
  PUT: putFile,
  DELETE: deleteFile
};

export default routes;
