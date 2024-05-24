import { type InferSelectModel } from "drizzle-orm";
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
  // logLevel: LogLevel.DEBUG,
});

(async () => {
  try {
    await initializationDrizzleClient()

    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');
  } catch (error) {
    console.error('Unable to start App', error);
  }
})();
