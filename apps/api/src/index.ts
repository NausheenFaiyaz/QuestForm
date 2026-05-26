import http from "node:http";
import { logger } from "@repo/logger";
import { formService } from "@repo/trpc/server/services";
import { app as expressApplication } from "./server";

import { env } from "./env";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });

    const runExpiryCheck = async () => {
      try {
        const processed = await formService.sendPendingExpiryNotifications();
        if (processed > 0) {
          logger.info(`processed ${processed} form expiry notifications`);
        }
      } catch (error) {
        logger.error("failed to process form expiry notifications", { error });
      }
    };

    void runExpiryCheck();
    setInterval(() => {
      void runExpiryCheck();
    }, 60 * 1000);
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
