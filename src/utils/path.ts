import convertPath from "@stdlib/utils-convert-path";
import path from "path";

export const getRelativePosixFilePath = (filePath: string) => {
  return convertPath(
    path.relative(process.cwd(), path.resolve(filePath)),
    "posix",
  );
};
