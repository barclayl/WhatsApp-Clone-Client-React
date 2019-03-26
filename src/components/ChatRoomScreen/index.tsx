import gql from 'graphql-tag';
import React from 'react';
import { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import ChatNavbar from './ChatNavbar';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import { useGetChatQuery, useAddMessageMutation } from '../../graphql/types';
import * as fragments from '../../graphql/fragments';
import { writeMessage } from '../../services/cache.service';

const Container = styled.div `
  background: url(/assets/chat-background.jpg);
  display: flex;
  flex-flow: column;
  height: 100vh;
`;

const getChatQuery = gql `
  query GetChat($chatId: ID!) {
    chat(chatId: $chatId) {
      ...FullChat
    }
  }
  ${fragments.fullChat}
`;

const addMessageMutation = gql `
  mutation AddMessage($chatId: ID!, $content: String!) {
    addMessage(chatId: $chatId, content: $content) {
      ...Message
    }
  }
  ${fragments.message}
`;

type TParams = { 
  chatId: string
};

interface ChatsResult {
  chats: any[];
}

const ChatRoomScreen: React.FC<RouteComponentProps<TParams>> = ({ history, match }) => {
  const { params: { chatId } } = match;

  const addMessage = useAddMessageMutation();

  const onSendMessage = useCallback((content) => {
    addMessage({
      variables: { chatId, content },
      optimisticResponse: {
        __typename: 'Mutation',
        addMessage: {
          __typename: 'Message',
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          content,
        }
      },
      update: (client, { data: { addMessage } }) => {
        writeMessage(client, addMessage);
      },
    })
  }, [chatId, addMessage]);

  const { data, loading } = useGetChatQuery({
    variables: { chatId }
  });
  if (data === undefined) {
    return null;
  }
  const chat = data.chat;
  const loadingChat = loading;

  if (loadingChat) return null;
  if (chat === null) return null;

  return (
    <Container>
      <ChatNavbar chat={chat} history={history} />
      <MessagesList messages={chat.messages} />
      <MessageInput onSendMessage={onSendMessage} />
    </Container>
  )
};

export default ChatRoomScreen;
