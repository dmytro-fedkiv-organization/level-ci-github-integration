import * as github from "@level-ci/github";
import * as managed from "@level-ci/managed";
import { defineConfig, directory, env } from "@level-ci/toolkit";

export default defineConfig({
  token: env.required("LEVEL_CI_TOKEN"),
  artifacts: [
    directory({
      path: "./level-ci-reports",
    }),
    managed.analyze({
      pages: [
        "https://example.com/1",
        "https://example.com/2",
        "https://example.com/3",
      ],
    }),
  ],
  integrations: [
    github.integration({
      token: env.required("GITHUB_TOKEN"),
      capabilities: [
        github.check({ name: "level-ci/accessibility" }),
        github.comment({ mode: "update" }),
        // custom inline annotation — full escape hatch
        github.annotation({
          id: "custom-score-comment",
          when: ({ pullRequest, scan }) =>
            Boolean(pullRequest) && scan.status === "ready",
          run: async ({ github, repo, pullRequest, score }) => {
            await github.rest.issues.createComment({
              ...repo,
              issue_number: pullRequest.number,
              body: `Score: ${score.value}`,
            });
          },
        }),
      ],
      onError: "warn",
    }),
  ],
});
