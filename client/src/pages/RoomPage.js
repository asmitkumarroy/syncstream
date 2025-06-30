import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import Chat from '../components/Chat';
import './RoomPage.css';

const RoomPage = () => {
  const { id: roomId } = useParams();
  const socket = useSocket();
  const { user } = useContext(AuthContext);
  const { enterRoom, leaveRoom } = usePlayer(); // Get room functions

  const [usersInRoom, setUsersInRoom] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hostId, setHostId] = useState(null);

  useEffect(() => {
    if (!socket || !user) return;
    
    socket.emit('join_room', { roomId, username: user.username });
    
    const handleUserUpdate = ({ users }) => {
        setUsersInRoom(users);
        const currentHostId = users[0]?.id || null;
        setHostId(currentHostId);
        // Set global room state for everyone in the room
        enterRoom(roomId, currentHostId);
    };

    const handleInitialJoin = ({ users }) => {
        handleUserUpdate({ users });
        setMessages(prev => [...prev, { type: 'notification', content: `You have joined the party!` }]);
    };
    
    socket.on('user_joined', handleInitialJoin);
    // ... rest of listeners are now in Player.js
    
    // IMPORTANT: When we leave this page, clear the global room state
    return () => {
      leaveRoom();
      socket.off('user_joined', handleInitialJoin);
    };
  }, [socket, roomId, user, enterRoom, leaveRoom]);

  // Separate effect for chat messages
  useEffect(() => {
      if (!socket) return;
      const handleReceiveMessage = (newMessage) => setMessages(prev => [...prev, { type: 'chat', ...newMessage }]);
      socket.on('receive_message', handleReceiveMessage);
      return () => socket.off('receive_message', handleReceiveMessage);
  }, [socket]);


  return (
    <div className="room-page-container">
      <div className="room-main-content">
        <div className="now-playing-info">
          <h1>Listening Party 🥳</h1>
          <p>Invite friends: <code>{window.location.href}</code></p>
        </div>
      </div>
      <div className="room-sidebar">
        <div className="user-list">
          <h3>In the room ({usersInRoom.length})</h3>
          <ul>
            {usersInRoom.map(u => (
              <li key={u.id}>{u.username} {u.id === socket?.id && ' (You)'}{u.id === hostId && ' 👑'}</li>
            ))}
          </ul>
        </div>
        <Chat roomId={roomId} messages={messages} />
      </div>
    </div>
  );
};

export default RoomPage;