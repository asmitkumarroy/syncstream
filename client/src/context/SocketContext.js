import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // This effect runs only once when the application loads.
        // It establishes the connection to our back-end server.
        const newSocket = io('http://localhost:5001');
        setSocket(newSocket);

        // This is a cleanup function. It ensures that when the app is closed,
        // the socket connection is properly terminated.
        return () => newSocket.close();
    }, []); // The empty dependency array ensures this runs only once.

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}