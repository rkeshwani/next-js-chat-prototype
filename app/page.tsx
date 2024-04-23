'use client';
import { useChat, Message } from 'ai/react';
import { useEffect, useState, useRef } from 'react';


export default function Chat() {
  
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>();
  const { messages, handleInputChange, handleSubmit, append} = useChat({initialMessages});
  const getOldMessages = async () => {
    const response = await fetch('/api/messages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const jsonResponse = (await response.json()) as Message[];
    console.log(jsonResponse);
    setInitialMessages(jsonResponse);
  }
  useEffect(()=>{
    getOldMessages();
  },[])
  useEffect(() => {
    if (!submitted && initialMessages?.length == 0) {
      const lastMessage = "Hi, how are you?";
      setInputValue(lastMessage);
      handleInputChange({ target: { value: lastMessage } } as React.ChangeEvent<HTMLInputElement>);
      let test:Message = {
        id:"initial",
        content: lastMessage,
        role: "user"
      }
      append(test);
      setSubmitted(true);
    }

    timerRef.current = setInterval(() => {
      if (messages.length > 0 && !submitted) {
        const lastMessage = messages[messages.length - 1].content;
        setInputValue(lastMessage);
        handleInputChange({ target: { value: lastMessage } } as React.ChangeEvent<HTMLInputElement>);
        let test:Message = {
          id:"initial",
          content: lastMessage,
          role: "user"
        }
        append(test);
        setSubmitted(true);
      }
    }, 60 * 1000); // 60 seconds

    return () => {
      clearInterval(timerRef.current);
    };
  }, [messages, handleInputChange, handleSubmit, submitted]);

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.length > 0
        ? messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </div>
        ))
        : null}

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
  );
}