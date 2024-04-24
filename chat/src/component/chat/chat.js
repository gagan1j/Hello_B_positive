import React, { useEffect, useState } from 'react';
import socketIo from "socket.io-client";
import './chat.css';
import { user } from '../Join/Join'; // Importing user as a named export
import Message from "../message/message";
import ReactScrollToBottom from "react-scroll-to-bottom";
import logo from '../../images/logo.png';

let socket;
const endpoint = "http://localhost:4000/";

const Chat = () => {
    const [id, setId] = useState("");
    const [messages, setMessages] = useState([]);

    const send = () => {
        const message = document.getElementById('chatinput').value;
        socket.emit('message', { message, id });
        document.getElementById('chatinput').value="";
    }

    useEffect(() => {
        socket = socketIo(endpoint, { transports: ['websocket'] });

        socket.on('connect', () => {
            alert("connected");
            setId(socket.id);
        });

        socket.emit('joined', { user }); // Pass user as an object

        socket.on('welcome', (data) => {
            setMessages((prevMessages) => {
                if (!prevMessages.find(message => message.id === data.id)) {
                    return [...prevMessages, data];
                }
                return prevMessages;
            });
            console.log(data.user, data.message);
        });

        socket.on('userJoined', (data) => {
            setMessages((prevMessages) => {
                if (!prevMessages.find(message => message.id === data.id)) {
                    return [...prevMessages, data];
                }
                return prevMessages;
            });
            console.log(data.user, data.message);
        });

        socket.on('leave', (data) => {
            setMessages((prevMessages) => {
                if (!prevMessages.find(message => message.id === data.id)) {
                    return [...prevMessages, data];
                }
                return prevMessages;
            });
            console.log(data.user, data.message);
        });

        return () => {
            socket.disconnect(); // Disconnect socket when component unmounts
        };
    }, []);

    useEffect(() => {
        socket.on('sendmessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
            console.log(data.user, data.message, data.id);
        });
        return () => {
            // Clean up function if needed
        };
    }, []);
    const goToHome = () => {
        window.location.href = 'http://localhost:4000/';
    };
    const goToabout = () => {
        window.location.href = 'http://localhost:4000/about_us';
    };
    const goTofaq = () => {
        window.location.href = 'http://localhost:4000/FAQ';
    };
    return (
        <div className='complete'>
            <div className='Topheader'>
                <div className='header1'>
                    <img src={logo} alt="logo" className='logo' />
                    <div className='nav-buttons'>
                        <button className='nav-button' onClick={goToHome}>Home</button>
                        <button className='nav-button'onClick={goToabout}>About</button>
                        <button className='nav-button'onClick={goTofaq}>FAQ</button>
                    </div>
                </div>
            </div>
            <div className='chatpage'>
                <div className="chatcontainer">
                    <div className="header">We Are With You.... </div>
                    <ReactScrollToBottom className="chatbox">
                        {messages.map((item, index) => (
                            <Message user={item.id === id ? '' : item.user} messageContent={item.message} classs={item.id === id ? 'right' : 'left'} />
                        ))}
                    </ReactScrollToBottom>
                    <div className="inputbox">
                        <input type='text' id='chatinput' autoFocus placeholder="Type your message here" />
                        <button onClick={send} className='sendinput'>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
 