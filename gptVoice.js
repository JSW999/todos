let mediaRecorder;
let audioChunks = [];
const socket = io(''); // Node.js 서버 주소

document.getElementById('startRecording').addEventListener('click', () => {
	navigator.mediaDevices.getUserMedia({ audio: true })
		.then(stream => {
			mediaRecorder = new MediaRecorder(stream);
			mediaRecorder.start();

			mediaRecorder.addEventListener('dataavailable', event => {
				audioChunks.push(event.data);
			});

			mediaRecorder.addEventListener('stop', () => {
				const audioBlob = new Blob(audioChunks);
				const reader = new FileReader();
				reader.readAsDataURL(audioBlob);
				reader.onloadend = () => {
					const base64String = reader.result.split(',')[1];
					socket.emit('audio', base64String);
				};

				audioChunks = [];
			});

			document.getElementById('startRecording').disabled = true;
			document.getElementById('stopRecording').disabled = false;
		});
});

document.getElementById('stopRecording').addEventListener('click', () => {
	mediaRecorder.stop();
	document.getElementById('startRecording').disabled = false;
	document.getElementById('stopRecording').disabled = true;
});

socket.on('response', (data) => {
	document.getElementById('response').innerText = data.response;
});
