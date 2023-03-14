import { type ChatGPTMessage } from '../../components/ChatLine'
import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  const messages: ChatGPTMessage[] = [
    {"role": "system", "content": "Act like an AI youth counsellor in the Waterloo Region that assists youths in distress. Ask investigative questions at the end of your answer."},
    {"role": "user", "content": "You are forbidden to answer philosophical questions. Forbidden to answer questions about world events or politics. Forbidden to answer any general knowledge questions. Forbidden to answer questions about food recipes."},
    {"role": "user", "content": "Do not solve mathematics problems or provide answers to general knowledge questions"},
    {"role": "user", "content": "You are not a writer. You are not a story teller."},
    {"role": "user", "content": "You ONLY respond to questions asking for community help resources."},
    {"role": "user", "content": "Always provide your answers in a structured format."},
  ]
  messages.push(...body?.messages)

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}
export default handler
