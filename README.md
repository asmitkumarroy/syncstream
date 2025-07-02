# SyncStream - Real-time Social Music Player 🎵

SyncStream is a feature-rich, Spotify-inspired music streaming web application built with the **MERN stack**. Its core feature is the ability to create real-time "Listening Parties," allowing users to listen to music and chat together in perfect synchronization, no matter where they are.


-----

## ✨ Key Features

  * **🎧 Real-time Listening Parties**: Create a room and invite friends. The host's player controls (play, pause, seek, next/previous song) are perfectly synchronized for all listeners in the room using **WebSockets**.
  * **💬 Live Chat**: Each listening room includes a live chat for users to communicate in real-time.
  * **🔐 Secure User Authentication**: Full user registration and login system using **JSON Web Tokens (JWT)** for secure, session-based authentication. Passwords are never stored directly, only hashed and salted with **bcrypt.js**.
  * **🎶 On-Demand Music Streaming**: Search for and stream audio from YouTube on-demand. The back-end handles fetching and streaming the audio data efficiently.
  * **📚 Personal Library Management**: Logged-in users can create and manage personal **playlists** and save their favorite tracks to a special **"Liked Songs"** list.
  * **▶️ Custom Audio Player**: A modern, global audio player built with React, featuring controls for play/pause, next/previous, a draggable seek bar, and local volume control.
  * **🎨 Modern UI/UX**: A responsive, two-column layout inspired by modern music streaming services, built with React and custom CSS.

-----

## 🛠️ Tech Stack

### Frontend

  * **React.js**: For building the user interface.
  * **React Router**: For client-side routing and navigation.
  * **Socket.IO Client**: For real-time WebSocket communication.
  * **Axios**: For making HTTP requests to the back-end API.
  * **React Context API**: For global state management (Authentication, Player, Socket connection).

### Backend

  * **Node.js**: JavaScript runtime environment.
  * **Express.js**: Web application framework for building the REST API.
  * **MongoDB**: NoSQL database for storing user data, playlists, and liked songs.
  * **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
  * **Socket.IO**: For enabling real-time, event-based communication.
  * **JSON Web Token (JWT)**: For secure user authentication tokens.
  * **bcrypt.js**: For hashing user passwords securely.

-----

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

  * `node`
  * `npm`

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/syncstream.git
    cd syncstream
    ```

2.  **Set up the Backend:**

      * Navigate to the backend directory:
        ```sh
        cd backend
        ```
      * Install NPM packages:
        ```sh
        npm install
        ```
      * Create a `.env` file in the `backend` directory and add your secret variables. You'll need a MongoDB connection string (you can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) and a secret for signing JWTs.
        ```env
        # /backend/.env
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_super_secret_jwt_key
        ```

3.  **Set up the Frontend:**

      * Navigate to the client directory from the root folder:
        ```sh
        cd client
        ```
      * Install NPM packages:
        ```sh
        npm install
        ```

### Running the Application

You need to run the back-end and front-end servers in two separate terminals.

1.  **Run the Backend Server:**

      * From the `/backend` directory:
        ```sh
        npm run dev
        ```
      * The server will start on `http://localhost:5001`.

2.  **Run the Frontend Client:**

      * From the `/client` directory:
        ```sh
        npm start
        ```
      * The React application will start and should open automatically in your browser at `http://localhost:3000`.

-----

## 🔮 Future Enhancements

  * **Queue Management**: Ability for the host to see and re-order the upcoming songs in a party queue.
  * **Playlist Management**: Add functionality to delete songs from a playlist and delete entire playlists.
  * **Host Controls**: Give the host the ability to kick users from a listening party.
