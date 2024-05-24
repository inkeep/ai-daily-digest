import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export const initializationDrizzleClient = async () => {
    const drizzleClient = new Client({
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
    });
    const db = drizzle(drizzleClient, { logger: true });

    await drizzleClient.connect();

    await migrate(db, {
        migrationsFolder: "drizzle",
    })
        .then(() => {
            console.log("migrations complete")
        })
        .catch((e) => console.error(e))
        .finally(async () => {
            await drizzleClient.end()
        });
}