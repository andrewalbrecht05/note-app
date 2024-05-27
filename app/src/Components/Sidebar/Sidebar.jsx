// Sidebar.js
import React, {useContext, useEffect, useState} from 'react';
import './Sidebar.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faNoteSticky} from "@fortawesome/free-solid-svg-icons";
import {Context} from "../../context";

const Sidebar = () => {
    const {fetchNotes} = useContext(Context);
    const {note,setNote} = useContext(Context);
    const {notes, setNotes} = useContext(Context);
    const {isAuth, setIsAuth} = useContext(Context);
    const noteTitles = notes.map(note => note.title);

    useEffect(() => {
        fetchNotes();
    }, []);

    async function handleLogout() {
        const url = "http://127.0.0.1:8080/api/auth/logout";
        try {
            const response = await fetch(url, {
                method: 'GET',
            });
            setIsAuth(false);
            setNotes([]);
            localStorage.removeItem("token");
        } catch (e) {
            console.error('There was a problem with the fetch operation:', e);
        }
    }

    async function handleNew() {
        const url = "http://127.0.0.1:8080/api/notes/";
        const tmp = {
            title: "",
            text: "",
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(tmp),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchNotes();
        } catch (e) {
            console.error('There was a problem with the fetch operation:', e);
        }
    }

    async function handleDelete() {
        if (!note) {
            alert("No selected note!");
            return;
        }
        const url = `http://127.0.0.1:8080/api/notes/${note.id}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                alert("You must choose note!");
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status !== 'success') {
                throw new Error(`Error fetching note: ${data.status}`);
            }
            alert("Deleted note successfully!");
            fetchNotes();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return null;
        }
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container" style={{display: "flex", gap: "5px"}}>
                    <FontAwesomeIcon icon={faNoteSticky} unicode={'f249'}/>
                    <h1 className="logo">Notenizer</h1>
                </div>
                <button className="new-note-button" onClick={handleNew}>+ New Note</button>
                <button className="new-note-button" onClick={handleLogout}>Logout</button>
                <button className="new-note-button" onClick={handleDelete}>Delete selected note</button>
            </div>
            <div className="sidebar-section">
                {/*<h2 className="sidebar-section-title">Recents</h2>
                <ul className="sidebar-list">
                    {noteTitles.map((note, index) => (
                        <li key={index} className={`sidebar-item ${index === 0 ? 'active' : ''}`}>
                            <a href="#">{note}</a>
                        </li>
                    ))}
                </ul>*/}
            </div>

        </aside>
    );
}

export default Sidebar;
