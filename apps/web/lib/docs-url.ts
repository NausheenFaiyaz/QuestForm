import { env } from "~/env.js";

const apiUrl = env.NEXT_PUBLIC_API_URL;
const apiOrigin = apiUrl ? apiUrl.replace(/\/trpc\/?$/, "") : "http://localhost:8000";

export const docsUrl = `${apiOrigin}/docs`;
