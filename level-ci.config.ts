import type { Config } from "@level-ci/cli";

export default {
  organization: "dmytro-fedkiv",
  project: "level-ci-github-integration-fork",
  token: process.env.LEVEL_CI_TOKEN,
  server: "https://dev.uw.ci.levelaccess.io/",
  reportPaths: ["./level-ci-reports"],
} satisfies Config;
