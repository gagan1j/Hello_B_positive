import React from 'react';
import "./message.css"

const Message = ({ user,messageContent,classs }) => {
     if(user){
        return (
            <div className={`messagebox ${classs}`}>
                { `${user} :${messageContent}`} 
            </div>
        );
     }
     else{
    return (
    <div className={`messagebox ${classs}`}>
            {`You: ${messageContent}`} 
        </div>
    );
}
}

export default Message;
