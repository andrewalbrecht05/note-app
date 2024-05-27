import React, {useEffect, useState} from 'react';
import "./App.css"
import Sidebar from "./Components/Sidebar/Sidebar";
import SidePreview from "./Components/SidePreview/SidePreview";
import Main from "./Components/Main/Main";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import {Navigate, Route, Routes} from "react-router-dom";
import {Context} from "./context";

function App() {
    const [notes, setNotes] = useState([]);
    const [isAuth, setIsAuth] = useState(false)
    const [note, setNote] = useState("");

    async function fetchNotes() {
        const url = "http://127.0.0.1:8080/api/notes/";
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status !== 'success') {
                throw new Error(`Error fetching notes: ${data.status}`);
            }

            setNotes(data.data.note);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) return false;

            try {
                const response = await fetch('http://127.0.0.1:8080/api/users/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                setIsAuth(response.ok && data.status === 'success');
            } catch (error) {
                console.error('An error occurred while checking authentication:', error);
                setIsAuth(false)
                return false;
            }
        };
        console.log(checkAuth())
        if (isAuth) {
            console.log('124234')
            fetchNotes();
        }

    }, []);

    return (
        <div className='App'>
            <Context.Provider value={{
                notes,
                setNotes,
                isAuth,
                setIsAuth,
                note,
                setNote,
                fetchNotes,
            }}>
                <Routes>
                    {
                        isAuth ?
                            <>
                                <Route
                                    path="/"
                                    element={
                                        <>
                                            <Sidebar/>
                                            <SidePreview/>
                                            <Main/>
                                        </>
                                    }
                                />
                                <Route path="/*" element={<Navigate to="/" />}/>
                            </>

                    :
                        <>
                            <Route path="/login" element={<Login />}/>
                            <Route path="/register" element={<Register />}/>
                            <Route path="/*" element={<Navigate to="/login" />}/>
                        </>
                    }
                </Routes>
            </Context.Provider>
        </div>
    )
}

export default App;
