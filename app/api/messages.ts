export const runtime = 'edge';
import { sql } from "@vercel/postgres";

export default async function GET(req: Request) {
    const query = await sql`SELECT * FROM messages;`;
    return query;
}