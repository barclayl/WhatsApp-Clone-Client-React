import { defaultDataIdFromObject } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import React from 'react';
import { useCallback } from 'react';
import { useQuery, useMutation } from 'react-apollo-hooks';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import ChatNavbar from './ChatNavbar';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import * as queries from '../../graphql/queries';
import * as fragments from '../../graphql/fragments';

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
  chats: any[];  // TODO: Put correct type here
}
  
const ChatRoomScreen = ({ history, match }: RouteComponentProps<TParams>) => {
  const { params: { chatId } } = match;
  const { data: { chat } } = useQuery<any>(getChatQuery, {
    variables: { chatId }
  });
  const addMessage = useMutation(addMessageMutation);

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
        type FullChat = { [key: string]: any };
        let fullChat;
        const chatId = defaultDataIdFromObject(chat);

        if (chatId === null) {
          return;
        }
        try {
          fullChat = client.readFragment<FullChat>({
            id: chatId,
            fragment: fragments.fullChat,
            fragmentName: 'FullChat',
          });
        } catch (e) {
          return;
        }

        if (fullChat === null) {
          return;
        }
        if (fullChat.messages.some((m:any) => m.id === addMessage.id)) return;

        fullChat.messages.push(addMessage);
        fullChat.lastMessage = addMessage;

        client.writeFragment({
          id: chatId,
          fragment: fragments.fullChat,
          fragmentName: 'FullChat',
          data: fullChat,
        });

        
        let data;
        try {
          data = client.readQuery<ChatsResult>({
            query: queries.chats,
          });
        } catch (e) {
          return;
        }

        if (!data) return;

        const chats = data.chats;

        if (!chats) return;

        const chatIndex = chats.findIndex((c:any) => c.id === chatId);

        if (chatIndex === -1) return;

        const chat = chats[chatIndex];

        // The chat will appear at the top of the ChatsList component
        chats.splice(chatIndex, 1);
        chats.unshift(chat);

        client.writeQuery({
          query: queries.chats,
          data: { chats: chats },
        });
      },
    })
  }, [chat, chatId, addMessage]);

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
