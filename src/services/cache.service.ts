import { DataProxy } from 'apollo-cache';
import { defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import * as fragments from '../graphql/fragments';
import * as queries from '../graphql/queries';
import { MessageFragment, useMessageAddedSubscription } from '../graphql/types';

type Client = ApolloClient<any> | DataProxy;

export const useCacheService = () => {
  useMessageAddedSubscription({
    onSubscriptionData: ({ client, subscriptionData: { data } }) => {
      if (data) {
        writeMessage(client, data.messageAdded);
      }
    }
  });
};

export const writeMessage = (client: Client, message: MessageFragment) => {
  let fullChat;

  const chatId = defaultDataIdFromObject(message);

  if (chatId === null) {
    return;
  }
  try {
    fullChat = client.readFragment({
      id: chatId,
      fragment: fragments.fullChat,
      fragmentName: 'FullChat',
    })
  } catch (e) {
    return;
  }

  if (fullChat === null || fullChat.messages === null) {
    return;
  }
  if (fullChat.messages.some((m: any) => m.id === message.id)) return;

  fullChat.messages.push(message);
  fullChat.lastMessage = message;

  client.writeFragment({
    id: chatId,
    fragment: fragments.fullChat,
    fragmentName: 'FullChat',
    data: fullChat,
  });


  let data;
  try {
    data = client.readQuery({
      query: queries.chats,
    })
  } catch (e) {
    return;
  };

  if (!data) return;

  const chats = data.chats;

  if (!chats) return;

  const chatIndex = chats.findIndex((c: any) => c.id === chatId);

  if (chatIndex === -1) return;

  const chat = chats[chatIndex];

  // The chat will appear at the top of the ChatsList component
  chats.splice(chatIndex, 1);
  chats.unshift(chat);

  client.writeQuery({
    query: queries.chats,
    data: { chats: chats },
  });
}
