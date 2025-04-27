import { io } from "socket.io-client";
const socket = io("http://192.168.0.243:8000"); // connecting to localhost backend - changed it to local network ip for testing purposes
export default socket;
