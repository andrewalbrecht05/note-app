import React from 'react';
import "./Register.css"
function Login() {
    return (
        <div className="register">
            <div className="container">
                <h1 style={{color: "blue"}}>Register</h1>
                <form>
                    <input placeholder="Username" type="text"/>
                    <input placeholder="E-mail" type="email"/>
                    <input placeholder="Password" type="password"/>
                    <button>Register</button>
                </form>
                <p>Have an account? Sign in</p>
            </div>
        </div>
    )
}

export default Login;