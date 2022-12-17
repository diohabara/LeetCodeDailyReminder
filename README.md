# LeetCodeDailyReminder

Create a LeetCode-daily-problem task at Todoist

## How to Set Up

- Get Todoist's API token [here](https://todoist.com/app/settings/integrations)
- Set `TODOIST_API_TOKEN` as an environment variable in `.env` like this
  - [ ] Rewrite `.env.template`
  - [ ] Run `mv .env.template .env`

  ```text
  TODOIST_API_TOKEN=??? # replace ??? by the API token
  ```

- Run [`gh secret set -f .env`](https://cli.github.com/manual/gh_secret_set) so that the secrets set in GitHub

## How to Run

```bash
deno run --allow-all main.ts
```

## References

- [LeetCode GraphQL](https://jerrynsh.com/how-i-sync-daily-leetcoding-challenge-to-todoist/)
- [Tosist API v2](https://www.npmjs.com/package/@doist/todoist-api-typescript)
