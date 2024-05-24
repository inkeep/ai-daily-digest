import { type InferSelectModel } from "drizzle-orm";
import { CronJob } from 'cron';
import { App, LogLevel } from "@slack/bolt";
import { CombinedEvaluationTable } from "./drizzleClient/schema";
import { initializationDrizzleClient } from "./drizzleClient/db";

require('dotenv').config();

export type GetQuestionFromAnalysisTable = {
  projectId: string;
  startDate: Date;
  endDate: Date;
};

export type QuestionWithLabels = InferSelectModel<
  typeof CombinedEvaluationTable
>;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

const main = async () => {
  try {
    const { client, start } = app;
    await initializationDrizzleClient();
    await start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running! ⚡️');

    const job = new CronJob(
      '0 0 0 * * *', // cronTime (every day)
      async function () {
        const response = await client.chat.postMessage({
          channel: process.env.NOTIFICATION_CHANNEL_ID!,
          text: ""
        });

        console.log("response", response);
      },
      null,
      true,
      'America/Los_Angeles'
    );

    job.start();
  } catch (error) {
    console.error('Unable to start App', error);
  }
}

main();
