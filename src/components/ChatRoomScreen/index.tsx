import React from 'react';
import { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import ChatNavbar from './ChatNavbar';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import { useGetChatQuery, useAddMessageMutation } from '../../graphql/types';
import * as queries from '../../graphql/queries';
import * as fragments from '../../graphql/fragments';

const Container = styled.div `
  background: url(/assets/chat-background.jpg);
  display: flex;
  flex-flow: column;
  height: 100vh;
`;

type TParams = { 
  chatId: string
};

interface ChatsResult {
  chats: any[];  // TODO: Put correct type here
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
        type FullChat = { [key: string]: any };
        let fullChat;
        const chatId = addMessage.id;

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
