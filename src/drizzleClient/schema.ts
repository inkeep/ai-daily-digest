import {
    pgTable,
    timestamp,
    text,
    boolean,
    jsonb,
    pgEnum,
} from "drizzle-orm/pg-core";
// Define the enum type for `qType`
export const qTypeEnum = pgEnum("q_type_enum", [
    "ACCOUNT_ISSUES",
    "BILLING",
    "COMMUNITY_AND_EVENTS",
    "SALES_AND_UPSELLS",
    "CONTACT_SUPPORT",
    "PROSPECTING_AND_PRICING",
    "COMPARISON_TO_3P",
    "MIGRATE_FROM_3P",
    "MIGRATE_FROM_1P",
    "IS_X_SUPPORTED_3P",
    "IS_X_SUPPORTED_1P",
    "HOW_TO_3P",
    "HOW_TO_1P",
    "TROUBLESHOOTING_3P",
    "TROUBLESHOOTING_1P",
    "HELP_IMPLEMENT_EXTENDED_1P",
    "WHAT_IS_1P",
    "OTHER",
]);

// Define the enum type for `isFeatureSupported`
export const yesNoNa = pgEnum("yes_no_na_enum", ["yes", "no", "n/a"]);

const resultsSchema = {
    resultTs: timestamp("result_timestamp").defaultNow(),
    // enriched information
    lang: text("human_language").notNull(), // Zod string to PostgreSQL text
    qSummary: text("question_summary").notNull(), // Zod string to PostgreSQL text
    qSubject: text("question_subject").notNull(), // Zod string to PostgreSQL text
    qCategory: text("question_category").notNull(), // Zod string to PostgreSQL text
    qIsInScope: boolean("question_is_in_scope").notNull(), // Zod boolean to PostgreSQL boolean
    qIsUnclear: boolean("question_is_unclear").notNull(), // Zod boolean to PostgreSQL boolean
    "1PEntities": jsonb("first_party_entities").$type<string[]>().notNull(), // Zod array to PostgreSQL jsonb
    "3PEntities": jsonb("third_party_entities").$type<string[]>().notNull(), // Zod array to PostgreSQL jsonb
    qType: qTypeEnum("question_type").notNull(), // Zod union to PostgreSQL enum
    hasDocsGap: yesNoNa("has_documentation_gap").notNull(), // Zod boolean to PostgreSQL boolean
    isFeatureSupported: yesNoNa("is_feature_supported").notNull(), // Zod union to PostgreSQL enum
    gapSummary: text("gaps_summary"), // Zod string to PostgreSQL text
    // original information
    qId: text("question_id").notNull(), // Zod string to PostgreSQL text
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    chatSessionId: text("chat_session_id").notNull(),
    orgAlias: text("org_alias").notNull(),
    orgId: text("org_id").notNull(),
    orgName: text("org_name").notNull(),
    integrationId: text("integration_id").notNull(),
    integrationName: text("integration_name").notNull(),
    projectId: text("project_id").notNull(),
    subjectName: text("subject_name").notNull(),
    projectDescription: text("project_description").notNull(),
    questionTs: timestamp("question_timestamp").notNull(),
}

// Define the table using the `pgTable` function
export const CombinedEvaluationTable2 = pgTable("results_2", resultsSchema);
export const CombinedEvaluationTable = pgTable("results", resultsSchema);