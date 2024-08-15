# Overview

1. Clone this repository

```bash
https://github.com/GeorgiyIzmailov/-slack-notification-bot.git
```

2. Install dependencies

```
pnpm install
```

3. Clone `.env` file

```bash
cat .env.sample >> .env
```
## Create Slack Bot

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) 
2. Click on **Create New App**
3. Select on **From an app manifest**
4. Pick the desired worksapce
5. Paste in the JSON file from `manifest.json`
6. Copy the **Signing Secret** in the **App Credentials** section to your `SLACK_SIGNING_SECRET` environment variable

### Get your Slack bot token
1. This token represents your bot.
2. Go to `OAuth & Permissions` tab
3. Copy the "**Bot User OAuth Token**"
4. paste into `SLACK_BOT_TOKEN`

## Configure your database credentials

```bash
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_user_pass
POSTGRES_DB=your_db_name
POSTGRES_HOST=db_host
POSTGRES_PORT=db_port
```

## Localy run

### Migrate your DB (only for local testing)

```
pnpm generate
```

### Start

```
pnpm start
```

