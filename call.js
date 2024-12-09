const http = require('http');
const express = require('express');
const twilio = require('twilio');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const accountSid = 'your_account_sid'; // Replace with your Twilio Account SID
const authToken = 'your_auth_token'; // Replace with your Twilio Auth Token
const client = twilio(accountSid, authToken);

app.post('/incoming', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say('Please leave a message after the beep.');
    twiml.record({
        recordingStatusCallback: '/recording-complete',
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent: ['completed']
    });
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
});

app.post('/recording-complete', (req, res) => {
    const recordingUrl = req.body.RecordingUrl;
    const recordingSid = req.body.RecordingSid;

    const filePath = path.join(__dirname, 'recordings', `${recordingSid}.mp3`);
    const file = fs.createWriteStream(filePath);

    http.get(recordingUrl + '.mp3', (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Recording saved:', filePath);
        });
    });

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});