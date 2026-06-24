// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server (adjust the port if yours is different)
const socket = io("http://localhost:4000");

export default socket;