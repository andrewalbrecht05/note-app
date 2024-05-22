import React, {useState} from 'react';
import RandNum from './Components/RandNum/RandNum';
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import NoteComponent from "./Components/Note/Note";
import "./App.css"

function App() {
    return (
        <div className='App'>
            <Login/>
            <Register/>
            <div className="main">
                <div className="container">
                    <h1>Users notes</h1>
                    <NoteComponent
                        title={"This is my note"}
                        dateCreated={"06.05.2024 15:30:45"}
                        dateLastModified={"06.05.2024 21:14:57"}
                    />
                    <NoteComponent
                        title={"Test2"}
                        dateCreated={"06.05.2012 15:30:45"}
                        dateLastModified={"06.05.2012 21:14:57"}
                    />
                </div>
            </div>
        </div>
    )
}

export default App;
