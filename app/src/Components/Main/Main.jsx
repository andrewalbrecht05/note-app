// Main.js
import React, {useCallback, useContext, useState} from 'react';
import './Main.css';
import MDEditor from '@uiw/react-md-editor';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder} from "@fortawesome/free-solid-svg-icons";
import {Context} from "../../context";
import _ from "lodash";

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB');
};


const Main = () => {
    const {isAuth, setIsAuth} = useContext(Context);
    const {note, setNote} = useContext(Context);
    const {fetchNotes} = useContext(Context);

    if (note === "") {
        return <div>Select a note to view</div>;
    }

    async function fetchNoteById(noteId, new_text, new_title) {
        const url = `http://127.0.0.1:8080/api/notes/${noteId}`;
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    text: new_text,
                    title: new_title
                })
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status !== 'success') {
                setIsAuth(false);
                throw new Error(`Error fetching note: ${data.status}`);
            }
            console.log('note in main', data.data.note);
            setNote(data.data.note);
            fetchNotes();
            return data.data.note;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return null;
        }
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const debouncedFetchNoteText = useCallback(_.debounce((noteId, newText) => {
        fetchNoteById(noteId, newText, note.title);
    }, 500), [note.title]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const debouncedFetchNoteTitle = useCallback(_.debounce((noteId, newTitle) => {
        fetchNoteById(noteId, note.text, newTitle);
    }, 500), [note.text]);

    const handleChange = (value) => {
        setNote(prevNote => ({ ...prevNote, text: value }));
        debouncedFetchNoteText(note.id, value);
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setNote(prevNote => ({ ...prevNote, title: newTitle }));
        debouncedFetchNoteTitle(note.id, newTitle);
    };

    return (
        <div className="main">
            <div className="note-detail">
                <input
                    className="note-title-input"
                    type="text"
                    value={note.title}
                    onChange={handleTitleChange}
                />
                <div className="note-meta">
                    <span className="note-date-created">
                        Created: {formatDate(note.createdAt)}
                    </span>
                    <span className="note-date-updated">
                        Last updated: {formatDate(note.updatedAt)}
                    </span>

                    <span className="note-folder">
                        <FontAwesomeIcon icon={faFolder}/>
                        <p>Personal</p>
                    </span>
                </div>
                <div className="note-content">
                    <MDEditor
                        value={note.text}
                        onChange={handleChange}
                    />
                    {/*<MdEditor renderHTML={text => mdParser.render(text)} allowPasteImage={true} className={"note-editor"}/>*/}
                    {/*<p>It's hard to believe that June is already over! Looking back on the month, there were a few highlights that stand out to me.</p>
                    <p>One of the best things that happened was getting promoted at work. I've been working really hard and it's great to see that effort recognized. It's also exciting to have more responsibility and the opportunity to contribute to the company in a bigger way. I'm looking forward to taking on new challenges and learning as much as I can in my new role.</p>
                    <p>I also had a great time on my vacation to Hawaii. The beaches were beautiful and I loved trying all of the different types of Hawaiian food. It was nice to relax and get away from the daily grind for a bit. I'm so grateful to have had the opportunity to take a trip like that.</p>
                    <p>On the downside, I feel like I didn't make as much progress on my fitness goals as I would have liked. I was really busy with work and didn't make it to the gym as often as I planned. I'm going to try to be more consistent in July and make exercise a higher priority. I know it will be good for my physical and mental health.</p>
                    <p>I also had a few rough patches in my relationships this month. I had a couple of misunderstandings with friends and it was hard to navigate those conflicts. But I'm glad we were able to talk things through and move past them. I value my relationships and I want to make sure I'm always working to be a good friend.</p>
                    <p>Overall, it was a good month with a mix of ups and downs. I'm looking forward to what July has in store! I'm hoping to make some more progress on my goals and spend quality time with the people I care about.</p>*/}
                </div>
            </div>
        </div>
    );
}

export default Main;
