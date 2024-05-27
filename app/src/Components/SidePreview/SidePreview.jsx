// MainContent.js
import React, {useContext, useState} from 'react';
import './SidePreview.css';
import {Context} from "../../context";

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB');
};

const SidePreview = () => {
    const {notes, setNotes} = useContext(Context);
    const {note, setNote} = useContext(Context);
    const handleNoteClick = (note) => {
        setNote(note);
    };

    return (
        <main className="main-content">
            <h1 className="main-title">Personal</h1>
            <div className="notes-list">
                {notes.map((note, index) => (
                    <div className="note-card" key={index} onClick={() => handleNoteClick(note)}>
                        <p className="note-list-title">{note.title}</p>
                        <p className="note-list-date_created">{formatDate(note.updatedAt)}</p>
                        <p className="note-list-text">
                            {note.text.length < 10 ? note.text : note.text.slice(0, 10) + '...'}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default SidePreview;
