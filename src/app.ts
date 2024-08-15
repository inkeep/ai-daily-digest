import { gte, and, lte } from "drizzle-orm";
import { App, LogLevel } from "@slack/bolt";
import { initializationDrizzleClient } from "./drizzleClient/db";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { CronJob } from "cron";
import { Client } from "pg";
import * as schema from './drizzleClient/schema';

require('dotenv').config();

export type GetQuestionFromMessageDashboardTable = {
  message_id: string;
  created_at: Date;
  chat_session_id: string;
  organization_id: string;
  project_id: string;
  question: string | null;
  thumbs_up: boolean;
  thumbs_down: boolean;
  is_feature_supported: boolean;
}[];

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


const currentDate = new Date();
const prevDay = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate() - 1,
);

const getMessageDataFromDB = async (db: NodePgDatabase<typeof schema>) => {
  return db.select({
    message_id: schema.messageDashboard.messageId,
    created_at: schema.messageDashboard.createdAt,
    chat_session_id: schema.messageDashboard.chatSessionId,
    organization_id: schema.messageDashboard.organizationId,
    project_id: schema.messageDashboard.projectId,
    question: schema.messageDashboard.question,
    thumbs_up: schema.messageDashboard.thumbsUp,
    thumbs_down: schema.messageDashboard.thumbsDown,
    is_feature_supported: schema.messageDashboard.isFeatureSupported,
  }).from(schema.messageDashboard).where(and(gte(schema.messageDashboard.createdAt, prevDay), lte(schema.messageDashboard.createdAt, currentDate)))
}

const sendMessageToSlackChannel = async ({
  countResponseQuestions,
  countQuestionsWithoutAnswers,
  countThumbsUp,
  countThumbsDown
}: Record<string, number>) => {
  const { message } = await app.client.chat.postMessage({
    channel: process.env.NOTIFICATION_CHANNEL_ID!,
    parse: 'none',
    blocks: [
      {
        type: 'section',
        text: {
          type: "mrkdwn",
          text: `
*Inkeep Report (${prevDay.toLocaleString('default', { month: 'long' })} ${prevDay.getDate()}, ${prevDay.getFullYear()})*\n
• Questions answered: ${countResponseQuestions} :speech_balloon: \n
• Ratings: ${countThumbsUp} :+1: / ${countThumbsDown} :-1: \n
• # of questions without answers in content: ${countQuestionsWithoutAnswers}. See in full :point_down:
            `
        },
      },
    ]
  });

  return message;
}

const formatterListQuestionsWithoutAnswers = (questionsWithoutAnswers: GetQuestionFromMessageDashboardTable) => {
  let message = ""

  questionsWithoutAnswers.forEach(({ question, organization_id, chat_session_id, project_id }) => {
    const questionFormatter = question && question.length > 200 ? `${question.substring(0, 200)}...` : question;

    let formatedText = `
*Question: ${questionFormatter}* \n
<${process.env.INKEEP_PORTAL_URL || "https://portal.inkeep.com"}/${organization_id}/projects/${project_id}/chat-sessions?chatId=${chat_session_id}|See in full>`

    message += formatedText
  })

  return message
}

const main = async () => {
  try {

    const db = drizzle(drizzleClient, { schema, logger: true });
    await initializationDrizzleClient(drizzleClient, db);

    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running! ⚡️');

    new CronJob(
      '* */24 * * *', // cronTime (every 24 hours)
      async function () {
        console.log("cron job run")

        let countThumbsUp = 0;
        let countThumbsDown = 0;

        const responseQuestions = await getMessageDataFromDB(db)

        const questionsWithoutAnswers = responseQuestions.filter(responseQuestion => {
          if (responseQuestion.thumbs_up) ++countThumbsUp;
          if (responseQuestion.thumbs_down) ++countThumbsDown;

          return !responseQuestion.is_feature_supported
        });

        const responseSendMessage = await sendMessageToSlackChannel({
          countResponseQuestions: responseQuestions.length,
          countQuestionsWithoutAnswers: questionsWithoutAnswers.length,
          countThumbsUp,
          countThumbsDown
        })

        await app.client.chat.postMessage({
          channel: process.env.NOTIFICATION_CHANNEL_ID!,
          thread_ts: responseSendMessage?.ts,
          blocks: [
            {
              type: 'section',
              text: {
                type: "mrkdwn",
                text: formatterListQuestionsWithoutAnswers(questionsWithoutAnswers),
              },
            },
          ]
        })

      },
      null,
      true,
    ).start();

  } catch (error) {
    console.error('Unable to start App', error);
  }
}

main();
