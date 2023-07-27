let currentUser;

function updateUser() {
    const userNameInput = document.getElementById("userNameInput");
    const userName = userNameInput.value;
    if (!userName) {
        alert("Please enter your name.");
        return;
    }
    currentUser = userName;
    loadNotes();
}

function addNote() {
    if (!currentUser) {
        alert("Please enter your name and click 'Update' first.");
        return;
    }

    const noteInput = document.getElementById("noteInput");
    const noteText = noteInput.value;
    noteInput.value = "";

    fetch(`/notes/${currentUser}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: noteText })
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to add note");
        }
        loadNotes();
    }).catch(function (error) {
        console.error(error);
        alert("Failed to add note");
    });
}

function deleteNote(note) {
    if (!currentUser) {
        alert("Please enter your name and click 'Update' first.");
        return;
    }

    fetch(`/notes/${currentUser}/${note.id}`, {
        method: 'DELETE'
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to delete note");
        }
        loadNotes();
    }).catch(function (error) {
        console.error(error);
        alert("Failed to delete note");
    });
}

function loadNotes() {
    if (!currentUser) {
        alert("Please enter your name and click 'Update' first.");
        return;
    }

    fetch(`/notes/${currentUser}`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Failed to fetch notes");
            }
            return response.json();
        })
        .then(function (data) {
            const notesList = document.getElementById("notesList");
            notesList.innerHTML = "";

            data.forEach(function (note) {
                const listItem = document.createElement("li");
                listItem.innerHTML = note.text;

                const deleteButton = document.createElement("button");
                deleteButton.innerText = "Delete";
                deleteButton.onclick = function () {
                    deleteNote(note);
                };

                listItem.appendChild(deleteButton);
                notesList.appendChild(listItem);
            });
        }).catch(function (error) {
            console.error(error);
            alert("Failed to fetch notes");
        });
}
