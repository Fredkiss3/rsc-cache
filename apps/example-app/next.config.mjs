// @ts-expect-error
import nextBuildId from "next-build-id";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  env: {
    BUILD_ID: await nextBuildId({ dir: __dirname })
  }
};

export default nextConfig;
