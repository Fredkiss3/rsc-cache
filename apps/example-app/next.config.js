const nextBuildId = require("next-build-id");

/** @type {import('next').NextConfig} */
module.exports = {
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  env: {
    BUILD_ID: nextBuildId.sync({ dir: __dirname })
  }
};
