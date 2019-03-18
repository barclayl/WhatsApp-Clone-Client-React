import React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import ChatNavbar from './ChatNavbar';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';

const Container = styled.div `
  background: url(/assets/chat-background.jpg);
  display: flex;
  flex-flow: column;
  height: 100vh;
`;

const getChatQuery = `
  query GetChat($chatId: ID!) {
    chat(chatId: $chatId) {
      id
      name
      picture
      messages {
        id
        content
        createdAt
      }
    }
  }
`;

type TParams = { 
  chatId: string
};
  
const ChatRoomScreen = ({ history, match }: RouteComponentProps<TParams>) => {
  const { params: { chatId } } = match;
  const [chat, setChat] = useState<any>(null);

  useMemo(async () => {
    const body = await fetch(`${process.env.REACT_APP_SERVER_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getChatQuery,
        variables: { chatId },
      }),
    });
    const { data: { chat } } = await body.json();
    setChat(chat);
  }, [chatId]);

  const onSendMessage = useCallback((content) => {
    const message = {
      id: chat.messages.length + 1,
      createdAt: Date.now(),
      content,
    };

    setChat({
      ...chat,
      messages: chat.messages.concat(message),
    });
  }, [chat]);

  if (!chat) return null;

  return (
    <Container>
      <ChatNavbar chat={chat} history={history} />
      <MessagesList messages={chat.messages} />
      <MessageInput onSendMessage={onSendMessage} />
    </Container>
  )
};

export default ChatRoomScreen;
