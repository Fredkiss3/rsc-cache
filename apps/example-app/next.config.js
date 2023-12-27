const nextBuildId = require("next-build-id");

/** @type {import('next').NextConfig} */
module.exports = {
  generateBuildId: () => {
    const buildId = nextBuildId({ dir: __dirname });
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    process.env.BUILD_ID = buildId;
    return buildId;
  }
};
