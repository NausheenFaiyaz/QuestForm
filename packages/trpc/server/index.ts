import { router } from "./trpc";
import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/forms/route";
import { healthRouter } from "./routes/health/route";

export const serverRouter = router({
  auth: authRouter,
  forms: formsRouter,
  health: healthRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
