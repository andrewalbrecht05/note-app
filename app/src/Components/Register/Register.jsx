import React, {useState} from 'react';
import "./Register.css"
import {Link, useNavigate} from "react-router-dom";

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    let navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the form from submitting the default way

        const userData = {
            email,
            password,
            name: username
        };

        try {
            const response = await fetch('http://127.0.0.1:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // If the registration was successful
                localStorage.setItem('token', data.token);
                console.log('Registration successful, token stored:', data.token);
                navigate('/login');
            } else {
                // Handle errors returned from the server
                alert(data.message);
                console.error('Registration failed:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('An error occurred during registration:', error);
        }
    };

    return (
        <div className="register">
            <div className="container">
                <h1 className={"register-text"} style={{color: "blue"}}>Register</h1>
                <form className={"register-form"} onSubmit={handleSubmit}>
                    <input
                        className="register-input"
                        placeholder="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="register-input"
                        placeholder="E-mail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="register-input"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className={"register-button"}>Register</button>
                </form>
                <p className={"register-text-link"}><Link to={"/login"}>Have an account? Sign in</Link></p>
            </div>
        </div>
    )
}

export default Register;