import React, {useContext, useState} from 'react';
import "./Login.css";
import {Context} from "../../context";
import {Link} from "react-router-dom";
import Register from "../Register/Register";

function Login() {
    const {fetchNotes} = useContext(Context);
    const {note, setNote} = useContext(Context);
    const {notes, setNotes} = useContext(Context);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {isAuth, setIsAuth} = useContext(Context);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way

        const loginData = {
            name: username,
            password
        };

        try {
            const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                // If the login was successful
                if (data.status === 'success') {
                    localStorage.setItem('token', data.token);
                    setIsAuth(true);
                    await fetchNotes();
                    setNote("");
                    console.log('Login successful, token stored:', data.token);
                } else {
                    // Handle case where status is not success

                    console.error('Login failed:', data.message || 'Unknown error');
                }
            } else {
                // Handle errors returned from the server
                alert(data.message);
                console.error('Login failed:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('An error occurred during login:', error);
        }
    };

    return (
        <div className="login">
            <div className="container">
                <h1 className="login-text" style={{color: 'blue'}}>Login</h1>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        className="login-input"
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="login-input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="login-button" type="submit">Login</button>
                    <p><Link to={"/register"}>Don't have an account?</Link></p>
                </form>
            </div>
        </div>
    );
}

export default Login;
