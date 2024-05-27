import { type Client } from "pg";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema"

export const initializationDrizzleClient = async (drizzleClient: Client, db: NodePgDatabase<typeof schema>) => {
    await drizzleClient.connect();

    await migrate(db, {
        migrationsFolder: "drizzle",
    })
        .then(() => console.log("migrations complete"))
        .catch((e) => console.error(e))
}