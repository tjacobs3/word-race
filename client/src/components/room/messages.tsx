import React, { useState, useEffect } from "react"
import { Socket } from "socket.io-client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

import TextInput from '../ui/form/text_input';


type Props = {
  socket: Socket;
  messages: Message[];
};

export interface Message {
  playerName: string;
  text: string;
}

export default function Messages({ socket, messages }: Props) {
  const [show, setShow] = useState(false);
  const [unseenMessages, setUnseenMessages] = useState(false);

  useEffect(() => {
    if (messages.length > 0) setUnseenMessages(!show && true);
  }, [messages, show]);

  const sendMessage = (message: string) => {
    if (message.length < 1) return;

    socket.emit('chat message', message);
  }

  const open = () => {
    setShow(!show);
    setUnseenMessages(false);
  }

  const messagesToDisplay = messages.map((message, i) => {
    return (
      <div key={i}>
        <strong>{message.playerName}: </strong>
        <span>{message.text}</span>
      </div>
    );
  }).reverse();

  return (
    <div className={`messages-panel px-3 d-flex flex-column ${show ? 'show' : ''}`}>
      <div className="messages-toggle pointer" onClick={open}>
        <FontAwesomeIcon icon={faComment} size="2x" />
        {unseenMessages && (
          <div className="unread-marker" />
        )}
      </div>
      <h4 className="text-center">Messages</h4>
      <div className="mb-3">
        <TextInput placeholder="Send a message ..." onEnterPressed={sendMessage} />
      </div>
      <div className="flex-grow-1 message-list">
        {messagesToDisplay}
      </div>
    </div>
  );
}
