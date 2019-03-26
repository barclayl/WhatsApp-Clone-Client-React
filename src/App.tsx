import React from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import ChatRoomScreen from './components/ChatRoomScreen';
import ChatsListScreen from './components/ChatsListScreen';
import AnimatedSwitch from './components/AnimatedSwitch';
import { useCacheService } from './services/cache.service';

const App: React.FC = () => {
  useCacheService()

  return (
    <BrowserRouter>
      <AnimatedSwitch>
        <Route exact path="/chats" component={ChatsListScreen} />
        <Route exact path="/chats/:chatId" component={ChatRoomScreen} />
      </AnimatedSwitch>
      <Route exact path="/" render={redirectToChats} />
    </BrowserRouter>
  )
};

const redirectToChats = () => (
  <Redirect to="/chats" />
);

export default App;
