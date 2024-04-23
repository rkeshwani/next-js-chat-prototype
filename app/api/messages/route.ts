export const runtime = 'edge';
import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
    const query = await sql`SELECT * FROM messages;`;
    const rows = query.rows;
    return NextResponse.json(rows);
}