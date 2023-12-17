require('dotenv').config()
const express = require('express');
const os = require('os');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// Initialize Firebase Admin SDK with environment variables
const serviceAccountPath = process.env.FIREBASE_KEY;
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "cps596.appspot.com"
});

const bucket = admin.storage().bucket();

app.post('/append-to-results', async (req, res) => { // 'async' was added here
    const { content } = req.body; // String to append

    try {
      // Download the file from Firebase Storage
      const tempFilePath = path.join(os.tmpdir(), 'results.txt');
      await bucket.file('results.txt').download({ destination: tempFilePath });

      // Append the string to the file
      fs.appendFileSync(tempFilePath, content + '\n');

      // Upload the file back to Firebase Storage
      await bucket.upload(tempFilePath, { destination: 'results.txt' });

      res.status(200).send('Content appended successfully');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error appending to file');
    }
});

app.post('/append-to-userID', async (req, res) => { // 'async' was added here
    const { content } = req.body; // String to append

    try {
      // Download the file from Firebase Storage
      const tempFilePath = path.join(os.tmpdir(), 'userID.txt');
      await bucket.file('userID.txt').download({ destination: tempFilePath });

      // Append the string to the file
      fs.appendFileSync(tempFilePath, content + '\n');

      // Upload the file back to Firebase Storage
      await bucket.upload(tempFilePath, { destination: 'userID.txt' });

      res.status(200).send('Content appended successfully');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error appending to file');
    }
});

app.get('/count-rows', async (req, res) => {
    try {
        // Replace 'your-file.txt' with the actual file name in Firebase Storage
        const fileName = 'userID.txt';
        const tempFilePath = path.join(os.tmpdir(), fileName);

        // Download the file from Firebase Storage
        await bucket.file(fileName).download({ destination: tempFilePath });

        // Read the file and count the rows
        const fileContent = fs.readFileSync(tempFilePath, 'utf-8');
        const numberOfRows = fileContent.trim().split('\n').length;

        // Cleanup: delete the temp file after counting rows
        fs.unlinkSync(tempFilePath);

        // Send the number of rows back to the client
        res.status(200).send({ numberOfRows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error counting rows in file');
    }
});


// Listen on the port Azure provides or default to 3000
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes