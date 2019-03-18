import { createMemoryHistory } from 'history';
import React from 'react';
import { cleanup, render, fireEvent, wait, getByTestId } from 'react-testing-library';
import MessagesList from './MessagesList';

describe('MessagesList', () => {
  afterEach(cleanup);

  it('renders messages data', () => {
    const messages = [
      {
        id: '1',
        content: 'foo',
        createdAt: new Date(0),
      },
      {
        id: '2',
        content: 'bar',
        createdAt: new Date(1000 * 60 * 60),
      },
    ];

    let message1, message2;
    {
      const { container, getAllByTestId, getByTestId } = render(<MessagesList messages={messages} />);
      const match = getAllByTestId('message-item');
      message1 = match[0];
      message2 = match[1];
    }

    expect(getByTestId(message1, 'message-content')).toHaveTextContent('foo');
    expect(getByTestId(message1, 'message-date')).toHaveTextContent('01:00');

    expect(getByTestId(message2, 'message-content')).toHaveTextContent('bar');
    expect(getByTestId(message2, 'message-date')).toHaveTextContent('02:00');
  });
});
