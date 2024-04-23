'use client';
import { useChat, Message } from 'ai/react';
import { useEffect, useState, useRef } from 'react';
import { Analytics } from "@vercel/analytics/react"
import logo from './logo.jpg';
import Image from 'next/image';
export default function Chat() {

  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timer | null | number>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>();
  const { messages, handleInputChange, handleSubmit, append } = useChat({ initialMessages });
  const getOldMessages = async () => {
    const response = await fetch('/api/messages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const jsonResponse = (await response.json()) as Message[];
    setInitialMessages(jsonResponse);
  }
  useEffect(() => {
    getOldMessages();
  }, [])
  useEffect(() => {
    if (!submitted && initialMessages?.length === 0) {
      const lastMessage = "Hi, how are you?";
      setInputValue(lastMessage);
      handleInputChange({ target: { value: lastMessage } } as React.ChangeEvent<HTMLInputElement>);
      let test: Message = {
        id: "initial",
        content: lastMessage,
        role: "user"
      }
      append(test);
      setSubmitted(true);
    }

    const interval = setInterval(() => {
      console.log("Running check to send automessage")
      if (messages.length > 0 && !submitted) {
        console.log("Running message check");
        const lastMessage = messages[messages.length - 1].content;
        console.log("Last message was");
        setInputValue(lastMessage);
        handleInputChange({ target: { value: lastMessage } } as React.ChangeEvent<HTMLInputElement>);
        let test: Message = {
          id: "auto" + Math.random(),
          content: lastMessage,
          role: "user"
        }
        append(test);
        setSubmitted(true);
      }
    }, 60 * 1000); // 60 seconds

    return () => {
      console.log("Reset automessage interval");
      clearInterval(interval);
    };
  }, [messages, submitted, initialMessages])

  return (
    <div>
      <div className="mx-auto w-full px-24 py-12 flex"><Image alt="Logo" className='w-20 h-20 mr-4' src={logo}/>This is a proof of concept of AI's talking to each other, hopefully engaging in playful conversation. Messages below have been generated across different user sessions.</div>
      <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
        {messages.length > 0
          ? messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'AI 2: ' : 'AI 1: '}
              {m.content}
            </div>
          ))
          : null}
        <div className="fixed w-full max-w-md bottom-20 border border-gray-300 rounded mb-8 shadow-xl p-2">In order to keep things fair, AI is only going to talk to itself once a minute to preserve tokens for others.</div>
        <form onSubmit={handleSubmit}>
          <input
            className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
            value={inputValue}
            placeholder="Say something..."
            onChange={handleInputChange}
            disabled
          />
        </form>
      </div>
    </div>
  );
}