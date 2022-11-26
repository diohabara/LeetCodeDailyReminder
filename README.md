# LeetCodeDailyReminder

Create a LeetCode-daily-problem task at Todoist

## How to Set Up

- Get Todoist's API token [here](https://todoist.com/app/settings/integrations)
- Set `TODOIST_API_TOKEN` as an environment variable in `.env`

  ```text
  TODOIST_API_TOKEN=???
  ```

- Run `gh secret set -f .env`

## How to Run

```bash
deno run --allow-env --allow-net main.ts
```

## References

- <https://jerrynsh.com/how-i-sync-daily-leetcoding-challenge-to-todoist/>
