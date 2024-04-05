const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const usernameInput = document.getElementById('username');
const changeUsernameButton = document.getElementById('changeUsernameButton');

changeUsernameButton.addEventListener('click', () => {
    const newUsername = document.getElementById('username').value.trim();

    if (newUsername !== '') {
        // Construct the URL with the new username
        const newURL = `/chat.html?username=${encodeURIComponent(newUsername)}`;

        // Redirect to the new URL
        window.location.href = newURL;
    }
});

// Get user name from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

console.log('Username from URL:', username); // Debugging line

const socket = io();

// Emit the "join" event to associate the username with the socket ID
console.log('Emitting join event with username:', username); // Debugging line
socket.emit('join', username);

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatform.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');

    if (message.username === username) {
        div.classList.add('message-right');
    } else {
        div.classList.add('message-left');
    }
    
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>
    `;

    chatMessages.appendChild(div);
}