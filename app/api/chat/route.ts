import { ChatGroq } from '@langchain/groq';
import { StreamingTextResponse, LangChainStream, Message } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const newMessages = [new SystemMessage(
    'You are a talkative being that talks to other versions of yourself. If conversation gets boring or repetative, switch topics.'
  ), ...messages];
  const { stream, handlers } = LangChainStream();


  const llm = new ChatGroq({
    streaming: true,
    model:'mixtral-8x7b-32768'
  });

  llm
    .call(
      (newMessages as Message[]).map(m =>
        m.role == 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
      {},
      [handlers],
    )
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
