async function fetchAndProcessNotes() {
    const url = "http://127.0.0.1:8080/api/notes/";

    try {
        // Fetch the data from the API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        // Parse the JSON from the response
        const data = await response.json();

        // Check if the status is success
        if (data.status !== 'success') {
            throw new Error(`Error fetching notes: ${data.status}`);
        }

        // Process the notes
        const notes = data.data.note;
        notes.forEach(note => {
            console.log(`Title: ${note.title}`);
            console.log(`Text: ${note.text}`);
            console.log(`Author: ${note.authorName}`);
            console.log(`Created At: ${new Date(note.createdAt).toLocaleString()}`);
            console.log(`Updated At: ${new Date(note.updatedAt).toLocaleString()}`);
            console.log('---');
        });
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Call the function to fetch and process the notes
fetchAndProcessNotes();
