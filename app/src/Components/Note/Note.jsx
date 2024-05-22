import React, {useRef} from 'react';
import "./Note.css"

function Note({title, dateCreated, dateLastModified}) {
    const ref = useRef(null);

    const handleChange = (e) => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = ref.current.scrollHeight + "px";
        }
    };
    return (
        <div className="note">
            <div className="container">
                <h1>{title}</h1>
                <p>Created: {dateCreated}</p>
                <p>Last Modified: {dateLastModified}</p>
                <textarea ref={ref} onChange={handleChange}/>
            </div>
        </div>
    )
}

export default Note;