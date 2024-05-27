import { gte, and, lte } from "drizzle-orm";
import { App, LogLevel } from "@slack/bolt";
import { initializationDrizzleClient } from "./drizzleClient/db";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from './drizzleClient/schema';

require('dotenv').config();

export type GetQuestionFromAnalysisTable = {
  projectId: string;
  startDate: Date;
  endDate: Date;
};

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

const drizzleClient = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// 2024-05-15 18:46:55.423 +0300

// const job = new CronJob(
//   '0 0 0 * * *', // cronTime (every day)
//   async function () {
//     const response = await client.chat.postMessage({
//       channel: process.env.NOTIFICATION_CHANNEL_ID!,
//       text: ""
//     });

//     console.log("response", response);
//   },
//   null,
//   true,
//   'America/Los_Angeles'
// );

// job.start();

const main = async () => {
  try {
    const currentDate = new Date("2024-05-15 18:46:55.423 +0300");
    const prevDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1,
    );

    const db = drizzle(drizzleClient, { schema, logger: true });
    await initializationDrizzleClient(drizzleClient, db);

    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');

    const repsonseQuestions = await db.select({
      message_id: schema.messageDashboard.messageId,
      created_at: schema.messageDashboard.createdAt,
      chat_session_id: schema.messageDashboard.chatSessionId,
      question: schema.messageDashboard.question,
      thumbs_up: schema.messageDashboard.thumbsUp,
      thumbs_down: schema.messageDashboard.thumbsDown,
      is_feature_supported: schema.messageDashboard.isFeatureSupported,
    }).from(schema.messageDashboard).where(and(gte(schema.messageDashboard.createdAt, prevDay), lte(schema.messageDashboard.createdAt, currentDate)))

    console.log("repsonseQuestions", repsonseQuestions);
  } catch (error) {
    console.error('Unable to start App', error);
  } finally {
    await drizzleClient.end()
  }
}

main();
