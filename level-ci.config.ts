import type { Config } from "@userway/cicd-core";

export default {
  organization: "dmytro-fedkiv",
  project: "level-ci-github-integration",
  token: "gnc4totzsr6bywqbcvtp7pyfim10rtffmvoz8tla",
  server: "https://cicd.qa.userway.dev",
  connection: "https://cicd.dev.userway.dev",
  pages: [
    {
      url: "/dmytro-fedkiv/projects",
      auth: {
        url: "https://cicd.dev.userway.dev/login",
        type: "form",
        credentials: {
          username: process.env.LEVEL_CI_USERNAME!,
          password: process.env.LEVEL_CI_PASSWORD!,
        },
        selectors: {
          username: 'form input[type="email"]',
          password: 'form input[type="password"]',
          submit: 'form button[type="submit"]',
        },
      },
    },
  ],
} satisfies Config;
