import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// The Express app compiled from backend/src/app.ts will be copied into
// functions/backendDist/ via a predeploy step (see firebase.json scripts).
// We then import it here and expose as an HTTPS function.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - path exists after predeploy copy
import app from "./backendDist/app.js";

export const api = onRequest({
  region: "asia-south1",
  cors: true,
}, (req, res) => {
  logger.info("API request", { path: req.path, method: req.method });
  return app(req, res);
});
