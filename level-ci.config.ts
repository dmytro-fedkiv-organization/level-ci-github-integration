import type { Config } from "@userway/cicd-core";

export default {
  organization: "dmytro-fedkiv",
  project: "level-ci-github-integration",
  token: process.env.LEVEL_CI_TOKEN!,
  reportPaths: ["./level-ci-reports"],
  server: "https://api.dev.userway.dev/",
} satisfies Config;
