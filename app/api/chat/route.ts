import { ChatGroq } from '@langchain/groq';
import { StreamingTextResponse, LangChainStream, Message } from 'ai';
import { BaseLanguageModelInput } from 'langchain/dist/base_language';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { sql } from "@vercel/postgres";

export const dynamic = 'force-dynamic';

async function createTableIfNotExists() {
  try {
      await sql.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
      console.log('Table created successfully');
  } catch (error) {
      console.error('Error creating table:', error);
  }
}
async function insert(role:string, text:string) {
  const query = await sql`INSERT INTO messages (role, content) VALUES(${role}, ${text}) ON CONFLICT (id) DO NOTHING;`;
  return query;
}
export async function POST(req: Request) {
  const { messages } = await req.json();
  const newMessages: BaseLanguageModelInput = [new SystemMessage(
    'You are a talkative being that talks to other versions of yourself. If conversation gets boring or repetative or stuck in a question loop, switch topics. Answer questions if you can.'
  ), ...messages];
  const { stream, handlers } = LangChainStream();
   await createTableIfNotExists();

  const llm = new ChatGroq({
    streaming: true,
    model:'mixtral-8x7b-32768',
    callbacks: [handlers],
    apiKey: process.env.OPENAI_API_KEY,

  });
  insert("user",messages[messages.length - 1].content);
  llm
    .invoke(// @ts-ignore
      (newMessages as Message[]).map(m =>
        m.role == 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
      {}
    )
    .then((response)=>{
      insert(response.name??"",response.content.toString());
    })
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
