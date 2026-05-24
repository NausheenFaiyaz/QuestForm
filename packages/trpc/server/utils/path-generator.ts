export function generatePath(base: string) {
  return function (path: string): `/${string}` {
    const cleanBase = base.replace(/^\/+|\/+$/g, "");
    const cleanPath = path.replace(/^\/+|\/+$/g, "");
    return `/${[cleanBase, cleanPath].filter(Boolean).join("/")}`;
  };
}
