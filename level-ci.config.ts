import type { Config } from "@level-ci/cli";

export default {
  organization: "dmytro-fedkiv",
  project: "level-ci-github-integration",
  token: process.env.LEVEL_CI_TOKEN,
  server: "https://cicd.dev.userway.dev",
  reportPaths: ["./level-ci-reports"],
} satisfies Config;
