import React from 'react';
import "./Login.css"
function Login() {
    return (
        <div className="login">
            <div className="container">
                <h1 style={{color: "blue"}}>Login</h1>
                <form>
                    <input placeholder="Username" type="text"/>
                    <input placeholder="Password" type="password"/>
                    <button>Login</button>
                </form>
                <p>Forgot your password?</p>
            </div>
        </div>
    )
}

export default Login;