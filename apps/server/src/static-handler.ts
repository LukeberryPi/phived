import {
  distRoot as sharedDistRoot,
  handleSiteRequest as sharedHandleSiteRequest,
} from "../../../scripts/static-site-handler.mjs";

export const distRoot: string = sharedDistRoot;
export const handleSiteRequest: (
  req: Request,
  root?: string
) => Promise<Response> = sharedHandleSiteRequest;
