import path from "node:path";
import convertPath from "@stdlib/utils-convert-path";

export const getRelativePosixFilePath = (filePath: string) => {
  return convertPath(
    path.relative(process.cwd(), path.resolve(filePath)),
    "posix",
  );
};
