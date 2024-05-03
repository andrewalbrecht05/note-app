import React, { useState } from 'react';
import './App.css';

function App() {
    const [labelText, setLabelText] = useState('Initial text');

    const handleClick = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/get_number');
            const data = await response.json();
            setLabelText(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="App">
            <button onClick={handleClick}>Click me!</button>
            <p>{labelText}</p>
        </div>
    );
}

export default App;
