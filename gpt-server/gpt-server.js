const express = require('express');
const fileUpload = require('express-fileupload');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:8080", // 허용할 도메인
        methods: ["GET", "POST"]
    }
});
const port = ;

app.use(cors()); // CORS 미들웨어 사용

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('audio', (data) => {
        const audioBuffer = Buffer.from(data, 'base64');
        const uploadPath = path.join(uploadDir, 'audio.wav');
        fs.writeFileSync(uploadPath, audioBuffer);

        const pythonPath = '';
        const scriptPath = '';
        const outputPath = path.join(uploadDir, 'output.txt');

        const pythonProcess = spawn(pythonPath, [scriptPath, uploadPath, outputPath]);

        pythonProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            fs.readFile(outputPath, 'utf8', (err, data) => {
                if (err) {
                    socket.emit('response', { response: 'Error processing audio file' });
                    return;
                }
                socket.emit('response', { response: data });
            });
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
