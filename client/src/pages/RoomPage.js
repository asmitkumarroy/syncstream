import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import Chat from '../components/Chat';
import './RoomPage.css';

const RoomPage = () => {
  const { id: roomId } = useParams(); // Get roomId from the URL parameters
  const socket = useSocket();
  const { user } = useContext(AuthContext);

  const [usersInRoom, setUsersInRoom] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // We must have a socket connection and user details before proceeding
    if (!socket || !user) {
      return;
    }

    // --- Let the server know we are joining this room ---
    socket.emit('join_room', { roomId, username: user.username });


    // --- Set up listeners for events from the server ---

    const handleUserJoined = ({ username, users }) => {
      console.log(`${username} joined the room.`);
      setUsersInRoom(users);
      setMessages(prev => [...prev, { type: 'notification', content: `${username} has joined the party!` }]);
    };

    const handleUserLeft = ({ username, users }) => {
      console.log(`${username} left the room.`);
      setUsersInRoom(users);
      setMessages(prev => [...prev, { type: 'notification', content: `${username} has left the party.` }]);
    };

    const handleReceiveMessage = (newMessage) => {
      setMessages(prev => [...prev, { type: 'chat', ...newMessage }]);
    };
    
    const handleError = (errorMessage) => {
        console.error("Received error from server:", errorMessage);
        alert(`Error: ${errorMessage}`);
    }

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('error', handleError);


    // This is a crucial cleanup step.
    // It removes the event listeners when the component is unmounted (e.g., user navigates away).
    // This prevents memory leaks and duplicate event handlers.
    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('error', handleError);
    };

  }, [socket, roomId, user]); // This effect re-runs if the socket, roomId, or user changes

  return (
    <div className="room-page-container">
      <div className="room-main-content">
        <div className="now-playing-info">
          <h1>Listening Party</h1>
          <p>Share this link with your friends to invite them!</p>
          <p>Your Room Link: <code>{window.location.href}</code></p>
          {/* We will add player sync info and controls here in the final step */}
        </div>
      </div>
      <div className="room-sidebar">
        <div className="user-list">
          <h3>In the room ({usersInRoom.length})</h3>
          <ul>
            {usersInRoom.map(u => (
              <li key={u.id}>
                {u.username} 
                {u.id === socket?.id && ' (You)'}
                {u.id === (usersInRoom[0] && usersInRoom[0].id) && ' 👑'} {/* Simple host indicator */}
              </li>
            ))}
          </ul>
        </div>
        <Chat roomId={roomId} messages={messages} />
      </div>
    </div>
  );
};

export default RoomPage;