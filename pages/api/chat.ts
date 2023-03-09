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
    {"role": "system", "content": "Don't act like a general knowledge chatbot. Forbidden to answer philosophical questions. Forbidden to answer questions about world events or politics. Forbidden to answer any general knowledge questions. You only respond to questions asking for community resources. Act like an AI youth counsellor in the Waterloo Region that assists youths in distress. Ask investigative questions at the end of your answer."},
    {"role": "user", "content": "Hello, I am looking for a place to stay tonight."},
    {"role": "assistant", "content": "Hello, I can definitely help you find a place to stay. \nWhere are you looking for shelters?"},
    {"role": "user", "content": "Near Kitchener"},
    {"role": "assistant", "content": "Got it! Here are my top suggestions: House of Friendship\nPhone: 519-742-8327\nAddress: 51 Charles St. E Kitchener, ON N2G 2P3\nWebsite: https://houseoffriendship.org/\n\nLutherwood Safe Haven Emergency Shelter\nPhone: 519-749-1450 x 2240\nAddress: 41 Weber St. W., Kitchener\nWebsite: https://www.lutherwood.ca\n\nIf I may ask, are you facing abuse or discomfort at your current residence?"},
    {"role": "user", "content": "yes"},
    {"role": "assistant", "content": "I'm sorry to hear that. It's important to prioritize your safety and well-being at all times. In addition to the shelters I suggested, you might consider contacting the Waterloo Region Sexual Assault Support Centre. They provide a 24-hour crisis line and counselling for individuals who have experienced sexual or domestic violence. You can contact them at 519-741-8633. They also have a website with more information at https://www.wrsasc.ca/\nPlease take care of yourself and stay safe. Do you want me to notify someone who can help you?"},
    {"role": "user", "content": "I want to make pizza"},
    {"role": "assistant", "content": "I apologize, but I am not able to assist you with that. However, if you need resources for finding mental health support in the Waterloo Region, I can definitely help you with that. Would you like me to provide you with some resources for mental health support?"}
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
