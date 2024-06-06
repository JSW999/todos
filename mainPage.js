document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadWidgetPositions, 500); // 500ms 지연 후 위치 로드

    const widgets = document.querySelectorAll('.widget'); // 위젯의 element 요소들을 리스트 형식으로 초기화
    widgets.forEach(widget => {  // 선택된 위젯의 위치 사이즈 정보를 로컬스토리지에서 값을 가져와 위젯 사이즈 지정
        const id = widget.id;
        const savedWidth = localStorage.getItem(`${id}-width`);
        const savedHeight = localStorage.getItem(`${id}-height`);

        if (savedWidth) {
            widget.style.width = savedWidth;
        }
        if (savedHeight) {
            widget.style.height = savedHeight;
        }
    });

    document.querySelectorAll('.resize-handle').forEach(handle => { // 위젯 사이즈 조절 박스를 선택 시 이벤트리스너 발생
        handle.addEventListener('mousedown', initResize);
    });

    function loadWidgetPositions() { // 위젯의 위치 정보를 로컬스토리지에서 값을 가져와 위치 지정
        $('.widget').each(function() {
            const id = this.id;
            const left = localStorage.getItem(`${id}-left`);
            const top = localStorage.getItem(`${id}-top`);

            if (left !== null && top !== null) {
                $(this).css({ left: `${left}px`, top: `${top}px`, position: 'absolute' });
            }
        });
    }

    function initializeCalendar() { // 위젯 내용 부분에 캘린더 표시
        const calendarEl = document.getElementById('calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ko',
            headerToolbar: {
                left: 'prev',
                center: 'title',
                right: 'next'
            },
            events: function(fetchInfo, successCallback, failureCallback) {
                var events = [];
                // 첫 번째 URL에서 데이터 가져오기
                $.ajax({
                    url: 'calendar/getEvent.jsp',
                    dataType: 'json',
                    success: function(data) {
                        var personalEvents = data.map(function(event) {
                            event.color = 'blue'; // 첫 번째 데이터는 파란색으로 설정
                            return event;
                        });
                        events = events.concat(personalEvents); // 파란색 이벤트 추가

                        // 두 번째 URL에서 데이터 가져오기
                        $.ajax({
                            url: 'calendar/getFriendEvent.jsp', // 두 번째 이벤트 데이터를 가져올 URL
                            dataType: 'json',
                            success: function(data) {
                                var friendEvents = data.map(function(event) {
                                    event.color = 'red'; // 두 번째 데이터는 빨간색으로 설정
                                    return event;
                                });
                                events = events.concat(friendEvents); // 빨간색 이벤트 추가

                                successCallback(events); // 모든 이벤트를 성공 콜백에 전달
                            },
                            error: function() {
                                failureCallback(); // 두 번째 AJAX 요청 실패 시 콜백 호출
                            }
                        });
                    },
                    error: function() {
                        failureCallback(); // 첫 번째 AJAX 요청 실패 시 콜백 호출
                    }
                });
            },
            editable: false,
            dayMaxEvents: true,
            fixedWeekCount: false
        });
        calendar.render();
        return calendar; 
    }

    let calendar = initializeCalendar();

    
    function saveWidgetSize(widget) {  // 위젯의 사이즈를 로컬스토리지에 저장
        const id = widget.id;
        const width = widget.style.width;
        const height = widget.style.height;

        localStorage.setItem(`${id}-width`, width);
        localStorage.setItem(`${id}-height`, height);
    }

    
    function saveWidgetPosition(widget) { // 위젯의 위치 정보를 로컬스토리지에 저장
        const id = widget.id;
        const position = $(widget).position();
        localStorage.setItem(`${id}-left`, position.left);
        localStorage.setItem(`${id}-top`, position.top);
    }

    
    function initResize(e) {  // 위젯의 사이즈 조절 기능
        const widget = e.target.parentElement;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(widget).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(widget).height, 10);

        function startResizing(e) {  // 마우스를 누르고 있을 경우 사이즈 정보를 계속 받아옴
            const newWidth = startWidth + e.clientX - startX;
            const newHeight = startHeight + e.clientY - startY;
            widget.style.width = `${newWidth}px`;
            widget.style.height = `${newHeight}px`;
            refreshWidget(widget);
        }

        function stopResizing() {  // 마우스를 뗄 경우 사이즈 정보 최종 저장 후 위젯 새로고침(새로고침은 캘린더 위젯만 해당)
            window.removeEventListener('mousemove', startResizing);
            window.removeEventListener('mouseup', stopResizing);
            saveWidgetSize(widget);
            refreshWidget(widget);
        }

        window.addEventListener('mousemove', startResizing);
        window.addEventListener('mouseup', stopResizing);

        e.preventDefault();
    }

    function refreshWidget(widget) {  // 캘린더 위젯 새로고침 함수
        const id = widget.id;

        if (id === 'widget2') {
            // 캘린더 위젯 새로고침
            console.log("새로고침");
            calendar.destroy(); // 기존 캘린더 인스턴스 제거
            calendar = initializeCalendar(); // 새로운 캘린더 인스턴스 생성 및 렌더링
        }
    }

    function initializeWeatherWidget(lat, lon) {  // 날씨 위젯 데이터 받아오기
        const apiKey = 'd91938c1ddaf0a3ca1be992ababfa691'; // OpenWeatherMap API 키
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
        const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;

        // 현재 날씨 데이터 가져오기
        fetch(weatherApiUrl)
            .then(response => response.json())
            .then(data => {
                document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
                document.getElementById('temperature').innerText = `${data.main.temp}°C`;
                document.getElementById('location').innerText = data.name;
                document.getElementById('modal-weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
                document.getElementById('modal-temperature').innerText = `${data.main.temp}°C`;
                document.getElementById('modal-location').innerText = data.name;
            })
            .catch(error => console.error('Error fetching weather data:', error));

        // 시간별 예보 및 5일 예보 데이터 가져오기
        fetch(forecastApiUrl)
            .then(response => response.json())
            .then(data => {
                const hourlyForecastContainer = document.getElementById('hourly-forecast');
                const fiveDayForecastContainer = document.getElementById('five-day-forecast');

                hourlyForecastContainer.innerHTML = '';
                fiveDayForecastContainer.innerHTML = '';

                // 시간별 예보 (최대 12시간)
                const hourlyForecasts = data.list.slice(0, 12);
                hourlyForecasts.forEach(forecast => {
                    const forecastElement = document.createElement('div');
                    forecastElement.className = 'hourly-forecast';
                    forecastElement.innerHTML = `
                        <p>${new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon">
                        <p>${forecast.main.temp}°C</p>
                    `;
                    hourlyForecastContainer.appendChild(forecastElement);
                });

                // 5일 예보
                const dailyForecasts = {};
                data.list.forEach(forecast => {
                    const date = new Date(forecast.dt * 1000).toLocaleDateString();
                    if (!dailyForecasts[date]) {
                        dailyForecasts[date] = {
                            date: date,
                            temps: [],
                            icon: forecast.weather[0].icon
                        };
                    }
                    dailyForecasts[date].temps.push(forecast.main.temp);
                });
				
				// 최고온도, 최저온도 값 받아오기
                Object.values(dailyForecasts).forEach(forecast => {
                    const maxTemp = Math.max(...forecast.temps);
                    const minTemp = Math.min(...forecast.temps);
                    const forecastElement = document.createElement('div');
                    forecastElement.className = 'five-day-forecast';
                    forecastElement.innerHTML = `
                        <p>${forecast.date}</p>
                        <img src="http://openweathermap.org/img/wn/${forecast.icon}.png" alt="Weather Icon">
                        <p>${maxTemp}°C</p>
                        <p>${minTemp}°C</p>
                    `;
                    fiveDayForecastContainer.appendChild(forecastElement);
                });
            })
            .catch(error => console.error('Error fetching forecast data:', error));
    }

    function getLocationAndInitializeWeatherWidget() {  // 사용자 위치 정보 받아오기
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                initializeWeatherWidget(lat, lon);
            }, error => {
                console.error('Error getting location:', error);
                // 기본 위치를 설정 (서울)
                initializeWeatherWidget(37.5665, 126.9780);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
            // 기본 위치를 설정 (서울)
            initializeWeatherWidget(37.5665, 126.9780);
        }
    }

    getLocationAndInitializeWeatherWidget();  // 위치 정보 받아오기 함수 실행
    
    document.getElementById('w_schedule').addEventListener('click', function() {  // 할 일 위젯 모달 열기
        document.getElementById('schedule-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('closeSchedule').addEventListener('click', function() {  // 할 일 위젯 모달 닫기
        document.getElementById('schedule-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    document.getElementById('w_calendar').addEventListener('click', function() {  // 캘린더 위젯 모달 열기
        document.getElementById('calendar-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('closeCalendar').addEventListener('click', function() {  // 캘린더 위젯 모달 닫기
        document.getElementById('calendar-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    document.getElementById('w_calendar').addEventListener('click', function() {  // 캘린더 모달 부분에 iframe 경로 지정 및 출력
        document.getElementById('iframe').src = 'calendar/calendar.html'; 
        document.getElementById('iframe-container').style.display = 'block';
    });
    
    document.getElementById('w_friendSchedule').addEventListener('click', function() {  // 친구 일정 위젯 모달 열기
        document.getElementById('f_schedule-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('f_closeSchedule').addEventListener('click', function() {  // 친구 일정 위젯 모달 닫기
        document.getElementById('f_schedule-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    document.getElementById('add-event-button').addEventListener('click', function() {  // 내 일정 모달 내에 일정 추가 버튼 (폼 열기)
        document.getElementById('add-event-form').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });

    document.getElementById('close-add-event-button').addEventListener('click', function() {  // 내 일정 모달 내에 닫기 버튼 (폼 닫기)
        document.getElementById('add-event-form').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });
    
    document.getElementById('open-weather-modal').addEventListener('click', function(){  // 날씨 위젯 모달 열기
        document.getElementById('weather-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });

    document.getElementById('close-weather-modal').addEventListener('click', function(){  // 날씨 위젯 모달 닫기
        document.getElementById('weather-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });
	
	
	document.getElementById('gptVoice-modal').addEventListener('click', function(){  // 날씨 위젯 모달 열기
        document.getElementById('voice-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });

    document.getElementById('closeVoice').addEventListener('click', function(){  // 날씨 위젯 모달 닫기
        document.getElementById('voice-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });
    
    $("#event-start-date-display").datepicker({  // 캘린더 일정 시작의 datepicker
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            $("#event-start-date").val(dateText);
            $(this).val(dateText);
            $("#event-end-date-display").datepicker("option", "minDate", dateText);
        }
    });

    $("#event-end-date-display").datepicker({  // 캘린더 일정 종료의 datepicker
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            $("#event-end-date").val(dateText);
            $(this).val(dateText);
        }
    });

    document.getElementById('save-add-event-button').addEventListener('click', function() {  // 캘린더 일정 저장 버튼 누를 시 값 초기화
        var title = document.getElementById('event-title').value;
        var startDate = document.getElementById('event-start-date').value;
        var endDate = document.getElementById('event-end-date').value;

        if (title && startDate && endDate) {
            $.ajax({
                url: 'addSchedule.jsp',
                method: 'POST',
                data: {
                    title: title,
                    start_date: startDate,
                    end_date: endDate
                },
                success: function(response) {
                    if (response.trim() === "success") { // 응답이 success인지 확인
                        alert("추가 완료");
                        window.location.href = "mainPage.jsp"; // 리디렉션
                    } else {
                        alert("추가 실패");
                    }
                },
                error: function() {
                    alert('추가 실패');
                }
            });
        }
    });

    $(document).ready(function() {  // 채팅 기능
        const socket = io('http://localhost:3000'); // Node.js 서버의 주소
        console.log("Loaded userID:", userID);

        let currentRoom = null; // 방 번호 저장 변수
        let isRoomOwner = false; // 방 생성자 여부 저장 변수

        // 페이지 로드 시 저장된 방 정보로 자동 재참여
        const savedRoom = localStorage.getItem('currentRoom');
        const savedRoomOwner = localStorage.getItem('isRoomOwner');
        if (savedRoom) {
            currentRoom = savedRoom;
            isRoomOwner = savedRoomOwner === 'true';
            joinRoom(currentRoom, isRoomOwner);
            socket.emit('joinRoom', { room: currentRoom, userID: userID });
        }
		
		// 모달 열기
        function openChatModal() {
            $('#modal-background').show();
            $('#chat-modal').show();
        }

        function closeChatModal() {
            $('#modal-background').hide();
            $('#chat-modal').hide();
        }

        $('#w_chat').click(openChatModal);
        $('#close-chat-modal').click(closeChatModal);

        $('#create-room-button').click(function() {  // 방 만들기 버튼 클릭 이벤트
            const roomNumber = Math.floor(1000 + Math.random() * 9000);
            alert('방 번호: ' + roomNumber);
            isRoomOwner = true;
            joinRoom(roomNumber, true);
            socket.emit('createRoom', { room: roomNumber, userID: userID });
            localStorage.setItem('currentRoom', roomNumber); // 방 정보 저장
            localStorage.setItem('isRoomOwner', true); // 방 생성자 정보 저장
        });

        $('#join-room-button').click(function() {  // 방 참가 버튼 클릭 이벤트
            const roomNumber = $('#room-number-input').val();
            if (roomNumber) {
                isRoomOwner = false;
                joinRoom(roomNumber, false);
                socket.emit('joinRoom', { room: roomNumber, userID: userID });
                localStorage.setItem('currentRoom', roomNumber); // 방 정보 저장
                localStorage.setItem('isRoomOwner', false); // 방 생성자 정보 저장
            } else {
                alert('방 번호를 입력하세요.');
            }
        });

        $('#send-message-button').click(function() {  // 메세지 보내기 버튼 클릭 이벤ㅌ
            sendMessage();
        });

        $('#chat-input').keyup(function(event) {  // 보내기 버튼 누르기 대신 엔터 입력도 가능
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        $('#delete-room-button').click(function() {  // 방 삭제 버튼 클릭 이벤트
            if (confirm('정말로 방을 삭제하시겠습니까?')) {
                socket.emit('deleteRoom', { room: currentRoom, userID: userID });
                localStorage.removeItem('currentRoom'); // 방 정보 삭제
                localStorage.removeItem('isRoomOwner'); // 방 생성자 정보 삭제
            }
        });

        $('#leave-room-button').click(function() {  // 방 나가기 버튼 클릭 이벤트
            if (confirm('정말로 방을 나가시겠습니까?')) {
                socket.emit('leaveRoom', { room: currentRoom, userID: userID });
                localStorage.removeItem('currentRoom'); // 방 정보 삭제
                localStorage.removeItem('isRoomOwner'); // 방 생성자 정보 삭제
            }
        });

        socket.on('roomDeleted', function() {  // 방 삭제시 서버에 해당 방 삭제 명령
            alert('방이 삭제되었습니다.');
            resetChat();
            closeChatModal();
        });

        socket.on('leftRoom', function() {  // 방에서 나갈 시 서버에 해당 유저 명령 
            alert('방을 나갔습니다.');
            resetChat();
            closeChatModal();
        });

        socket.on('message', function(data) {  // 서버에 메세지 저장
            addMessage(data.userID, data.message, 'received', data.timestamp);
        });

        socket.on('previousMessages', function(messages) {  // 방에 있는 이전 메세지들 출력
            $('#chat-messages').empty(); // 중복 방지를 위해 채팅 기록 초기화
            $('#chat-messages-widget').empty(); // 중복 방지를 위해 채팅 기록 초기화
            messages.forEach(message => {
                addMessage(message.userID, message.message, 'received', message.timestamp);
            });
        });

        function joinRoom(roomNumber, isOwner) {  // 방 참가시 실행
            currentRoom = roomNumber;
            $('#chat-room').show();
            $('#chat-room-widget').show(); // 위젯 채팅방 표시
            $('#chat-messages').empty(); // 방에 참여할 때마다 채팅 기록 초기화
            $('#chat-messages-widget').empty(); // 방에 참여할 때마다 채팅 기록 초기화
            if (isOwner) {
                $('#delete-room-button').show();
                $('#leave-room-button').hide();
            } else {
                $('#delete-room-button').hide();
                $('#leave-room-button').show();
            }
            hideRoomJoinElements(); // 방 번호 입력과 참가 버튼 숨기기

            updateChatWidgetSize(); // 채팅방 생성 시 위젯 사이즈 맞춤

            $('#chat-values').html(`
                <div class="icon" id="w_chat">></div>
                <div id="chat-room-widget">
                    <div id="chat-messages-widget" style="height: 100px; overflow-y: auto;"></div>
                    <input type="text" id="chat-input-widget" placeholder="메시지를 입력하세요">
                    <button id="send-message-button-widget">보내기</button>
                </div>
            `);  // 채팅 위젯 내용 부분에 채팅방 출력 

            $('#send-message-button-widget').click(function() {  // 위젯 채팅방에서 메세지 보내기 기능
                sendMessage();
            });

            $('#chat-input-widget').keyup(function(event) {  // 위젯 채팅방에서 엔터로 메세지 보내기 기능
                if (event.key === 'Enter') {
                    sendMessage();
                }
            });

            $('#w_chat').click(openChatModal);
        }

        function sendMessage() {  // 메세지 보내기 함수
            const message = $('#chat-input').val() || $('#chat-input-widget').val();
            if (message) {
                socket.emit('sendMessage', {
                    room: currentRoom,
                    userID: userID,
                    message: message
                });
                $('#chat-input').val('');
                $('#chat-input-widget').val('');
            }
        }

        function addMessage(userID, text, type, timestamp) {  // 메세지 저장 함수
            const messageElement = $('<div>').addClass('message ' + type);
            messageElement.html('<span class="userID">' + userID + ':</span><span class="text">' + text + '</span><span class="timestamp">' + new Date(timestamp).toLocaleTimeString() + '</span>');
            $('#chat-messages').append(messageElement);
            $('#chat-messages').scrollTop($('#chat-messages')[0].scrollHeight);

            // 위젯에도 메시지 추가
            const messageElementWidget = $('<div>').addClass('message ' + type);
            messageElementWidget.html('<span class="userID">' + userID + ':</span><span class="text">' + text + '</span><span class="timestamp">' + new Date(timestamp).toLocaleTimeString() + '</span>');
            $('#chat-messages-widget').append(messageElementWidget);
            $('#chat-messages-widget').scrollTop($('#chat-messages-widget')[0].scrollHeight);
        }

        function hideRoomJoinElements() {  // 방을 만들거나, 참가시 중복 방 생성, 참가를 막기 위해 해당 기능을 hide 처리
            $('#room-number-input').hide();
            $('#join-room-button').hide();
            $('#create-room-button').hide();
        }

        function showRoomJoinElements() {  // 방에 참여하고 있지 않고 있을 때, 방 생성이나 참가를 위해 해당 기능을 show 처리
            $('#room-number-input').show();
            $('#join-room-button').show();
            $('#create-room-button').show();
        }

        function resetChat() {  // 방에 나갔을 시 해당 기능들 실행(메세지 초기화, 채팅방 가리기, 방삭제, 방나가기 버튼 가리기, 채팅 위젯 html 수정 등)
            $('#chat-messages').empty();
            $('#chat-messages-widget').empty();
            $('#chat-room').hide();
            $('#chat-room-widget').hide();
            $('#delete-room-button').hide();
            $('#leave-room-button').hide();
            $('#chat-values').html('<div class="icon" id="w_chat">></div>');
            $('#w_chat').click(openChatModal);
            showRoomJoinElements();
        }

        function updateChatWidgetSize() {  // 채팅 위젯의 사이즈 변경 함수
            const widget = $('#widget4');
            const widgetMessages = $('#chat-messages-widget');
            const widgetRoom = $('#chat-room-widget');
            const widgetHeight = widget.height();
            const widgetWidth = widget.width();
            widgetRoom.height(widgetHeight - 60);
            widgetRoom.width(widgetWidth);
            widgetMessages.height(widgetHeight - 60); // 버튼과 입력 필드 높이 제외
            widgetMessages.width(widgetWidth - 20); // 패딩 제외
        }

        // 초기 사이즈 설정
        updateChatWidgetSize();

        // 윈도우 리사이즈 이벤트에 대응
        $(window).resize(function() {
            updateChatWidgetSize();
        });

        $(".widget").draggable({  // 위젯 드래그 기능
            // containment: "parent", // 부모 요소 내에서만 드래그 가능 (사용 안함)
            stack: ".widget", // 위젯들이 겹치지 않도록 설정
            stop: function(event, ui) {  // 드래그가 멈출 시 위젯 위치 저장
                saveWidgetPosition(this);
            }
        });

        // 위젯 리사이즈 핸들러 추가 (위의 기능에 드래그 비활성화 기능 추가, 기능 중복이지만 아직 업데이트를 하지 않음)
        $('.resize-handle').on('mousedown', function(e) {  
            const $widget = $(this).closest('.widget');
            const $widget4 = $('#widget4');

            // 리사이즈 중에는 드래그를 비활성화
            $widget.draggable('disable');

            function onMouseMove(e) {
                const width = e.pageX - $widget.offset().left;
                const height = e.pageY - $widget.offset().top;
                $widget.css({ width, height });

                if ($widget.is($widget4)) {
                    updateChatWidgetSize();
                }
            }

            function onMouseUp() {
                $(window).off('mousemove', onMouseMove);
                $(window).off('mouseup', onMouseUp);

                if ($widget.is($widget4)) {
                    updateChatWidgetSize();
                }

                // 리사이즈가 끝나면 드래그를 다시 활성화
                $widget.draggable('enable');
                saveWidgetSize($widget[0]);
            }

            $(window).on('mousemove', onMouseMove);
            $(window).on('mouseup', onMouseUp);
        });
    });
});
