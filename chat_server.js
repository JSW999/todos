const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:8080", // 클라이언트의 주소
        methods: ["GET", "POST"]
    }
});

// Enable CORS for all routes
app.use(cors());

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // MySQL 사용자 이름
    password: '1234', // MySQL 사용자 비밀번호
    database: 'chatDB' // 사용하고자 하는 데이터베이스 이름
});

// 데이터베이스 연결
db.connect(err => {
    if (err) {
        console.error('MySQL 연결 오류: ', err);
        return;
    }
    console.log('MySQL에 연결되었습니다.');
});

const roomOwners = {}; // 방 생성자 정보를 저장할 객체

// Socket.io 연결 처리
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (data) => {
        const { room, userID } = data;
        roomOwners[room] = userID; // 방 생성자를 저장
        socket.join(room);
        console.log(`Room created: ${room} by ${userID}`);
    });

    socket.on('joinRoom', (data) => {
        const { room, userID } = data;
        socket.join(room);
        console.log(`Client joined room: ${room}`);

        // 이전 메시지 로드
        db.query("SELECT userID, message, timestamp FROM messages WHERE room_id = ?", [room], (err, results) => {
            if (err) {
                console.error('DB 조회 오류: ', err);
                return;
            }
            socket.emit('previousMessages', results);
        });
    });

    socket.on('deleteRoom', (data) => {
        const { room, userID } = data;
        if (roomOwners[room] === userID) { // 방 생성자인지 확인
            db.query("DELETE FROM messages WHERE room_id = ?", [room], (err) => {
                if (err) {
                    console.error('DB 삭제 오류: ', err);
                } else {
                    console.log(`Room ${room} deleted by ${userID}`);
                    delete roomOwners[room]; // 방 생성자 정보 삭제
                    io.to(room).emit('roomDeleted'); // 방이 삭제되었음을 알림
                    io.socketsLeave(room); // 모든 소켓을 방에서 나가게 함
                }
            });
        }
    });

    socket.on('leaveRoom', (data) => {
        const { room, userID } = data;
        if (roomOwners[room] !== userID) { // 방 생성자가 아닌 경우
            socket.leave(room);
            console.log(`User ${userID} left room ${room}`);
            socket.emit('leftRoom'); // 방을 나간 사용자에게만 알림
        }
    });

    socket.on('sendMessage', (data) => {
        const { room, userID, message } = data;
        console.log('Received message data:', data);
        io.to(room).emit('message', { userID, message, timestamp: new Date() });

        // 메시지 데이터베이스에 저장
        db.query("INSERT INTO messages (room_id, userID, message) VALUES (?, ?, ?)", [room, userID, message], (err) => {
            if (err) {
                console.error('DB 저장 오류: ', err);
            } else {
                console.log('메시지가 DB에 저장되었습니다.');
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
    
    // 관리자용 API 엔드포인트 추가
	app.delete('/admin/deleteAllRooms', (req, res) => {
        db.query("DELETE FROM messages", (err) => {
            if (err) {
                console.error('DB 삭제 오류: ', err);
                return res.status(500).send('DB 삭제 오류');
            } else {
                console.log(`All rooms deleted by admin`);
                Object.keys(roomOwners).forEach(room => {
                    io.to(room).emit('roomDeleted'); // 방이 삭제되었음을 알림
                    io.socketsLeave(room); // 모든 소켓을 방에서 나가게 함
                    delete roomOwners[room]; // 방 생성자 정보 삭제
                });
                return res.send('모든 방이 성공적으로 삭제되었습니다.');
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
