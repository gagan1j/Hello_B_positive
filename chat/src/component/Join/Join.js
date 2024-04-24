import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './join.css';
import logo from '../../images/doctor-pf.jpg';

let user = '';

const Join = () => {
    const [inputUser, setInputUser] = useState('');
    const sendUser = () => {
        user = inputUser;
    };
    return (
        <div className="JoinPage">
            <div className="JoinContainer">
                <h1>Chat With Doctor</h1>
                <img src={logo} alt="logo" />
                <input
                    placeholder="UserName"
                    type="text"
                    value={inputUser}
                    onChange={(e) => setInputUser(e.target.value)}
                    id="joininput"
                    />
                <Link  onClick={(event)=>! inputUser ?event.preventDefault():null} to="/chat">
                    <button onClick={sendUser} className="login">
                        Login
                    </button>
                </Link>
            </div>
        </div>
    );
};
export default Join;
export { user };
