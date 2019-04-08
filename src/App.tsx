import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import AuthScreen from './components/AuthScreen';
import ChatRoomScreen from './components/ChatRoomScreen';
import ChatsListScreen from './components/ChatsListScreen';
import ChatCreationScreen from './components/ChatCreationScreen';
import AnimatedSwitch from './components/AnimatedSwitch';
import { withAuth } from './services/auth.service';

const App: React.FC = () => (
  <BrowserRouter>
    <AnimatedSwitch>
      <Route exact path="/sign-in" component={AuthScreen} />
      <Route exact path="/chats" component={withAuth(ChatsListScreen)} />
      <Route exact path="/chats/:chatId" component={withAuth(ChatRoomScreen)} />
      <Route exact path="/new-chat" component={withAuth(ChatCreationScreen)} />
    </AnimatedSwitch>
    <Route exact path="/" render={redirectToChats} />
  </BrowserRouter>
);

const redirectToChats = () => (
  <Redirect to="/chats" />
);

export default App;
