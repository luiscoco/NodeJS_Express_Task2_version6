const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.static('public'));

app.use(session({
    secret: 'node_tutorial',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    if (!req.session.notes) {
        req.session.notes = {};
    }
    next();
});

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

function getNotesFromDatabase(req, user) {
    return req.session.notes[user] || [];
}

function saveNotesToFile(user, notes) {
    const filePath = path.join(__dirname, `${user}.json`);
    fs.writeFile(filePath, JSON.stringify(notes), (err) => {
        if (err) {
            console.error(`Error writing notes to file for ${user}`, err);
        }
    });
}

function readNotesFromFile(user, callback) {
    const filePath = path.join(__dirname, `${user}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading notes from file for ${user}`, err);
            callback([]);
        } else {
            try {
                const notes = JSON.parse(data);
                callback(notes);
            } catch (parseError) {
                console.error(`Error parsing notes from file for ${user}`, parseError);
                callback([]);
            }
        }
    });
}

app.get("/notes/:user", async function (req, res) {
    try {
        const user = req.params.user;
        // Read notes from the file for the specific user
        readNotesFromFile(user, function (notes) {
            console.log(`Reading notes for ${user}`, notes);
            res.send(notes);
        });
    } catch (error) {
        console.error("Error reading notes", error);
        res.status(500).json({ error: "Error reading notes" });
    }
});

app.post("/notes/:user", async function (req, res) {
    try {
        const user = req.params.user;
        let note = req.body;
        note.id = uid(); // Generate a unique id for the note
        req.session.notes[user] = req.session.notes[user] || [];
        req.session.notes[user].push(note);
        console.log(`Added note for ${user}`, req.session.notes[user]);

        // Save notes to the file for the specific user
        saveNotesToFile(user, req.session.notes[user]);

        res.end();
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

app.delete("/notes/:user/:id", async function (req, res) {
    try {
        const user = req.params.user;
        const noteId = req.params.id;

        // Find the note by its id and remove it from the list of notes for the specific user
        req.session.notes[user] = req.session.notes[user].filter((note) => note.id !== noteId);
        console.log(`Deleted note for ${user}`, req.session.notes[user]);

        // Save notes to the file after deletion for the specific user
        saveNotesToFile(user, req.session.notes[user]);

        res.end();
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
