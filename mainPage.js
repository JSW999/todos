document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadWidgetPositions, 500); // 500ms 지연 후 위치 로드

    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
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

    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', initResize);
    });

    function loadWidgetPositions() {
        $('.widget').each(function() {
            const id = this.id;
            const left = localStorage.getItem(`${id}-left`);
            const top = localStorage.getItem(`${id}-top`);

            if (left !== null && top !== null) {
                $(this).css({ left: `${left}px`, top: `${top}px`, position: 'absolute' });
            }
        });
    }

    function initializeCalendar() {
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

    // Function to save widget size
    function saveWidgetSize(widget) {
        const id = widget.id;
        const width = widget.style.width;
        const height = widget.style.height;

        localStorage.setItem(`${id}-width`, width);
        localStorage.setItem(`${id}-height`, height);
    }

    // Function to save widget position
    function saveWidgetPosition(widget) {
        const id = widget.id;
        const position = $(widget).position();
        localStorage.setItem(`${id}-left`, position.left);
        localStorage.setItem(`${id}-top`, position.top);
    }

    // Function to handle resize initialization
    function initResize(e) {
        const widget = e.target.parentElement;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(widget).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(widget).height, 10);

        function startResizing(e) {
            const newWidth = startWidth + e.clientX - startX;
            const newHeight = startHeight + e.clientY - startY;
            widget.style.width = `${newWidth}px`;
            widget.style.height = `${newHeight}px`;
            refreshWidget(widget);
        }

        function stopResizing() {
            window.removeEventListener('mousemove', startResizing);
            window.removeEventListener('mouseup', stopResizing);
            saveWidgetSize(widget);
            refreshWidget(widget);
        }

        window.addEventListener('mousemove', startResizing);
        window.addEventListener('mouseup', stopResizing);

        e.preventDefault();
    }

    function refreshWidget(widget) {
        const id = widget.id;

        if (id === 'widget2') {
            // 캘린더 위젯 새로고침
            console.log("새로고침");
            calendar.destroy(); // 기존 캘린더 인스턴스 제거
            calendar = initializeCalendar(); // 새로운 캘린더 인스턴스 생성 및 렌더링
        }
    }

    function initializeWeatherWidget(lat, lon) {
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

    function getLocationAndInitializeWeatherWidget() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                initializeWeatherWidget(lat, lon);
            }, error => {
                console.error('Error getting location:', error);
                // 기본 위치를 설정 (예: 서울)
                initializeWeatherWidget(37.5665, 126.9780);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
            // 기본 위치를 설정 (예: 서울)
            initializeWeatherWidget(37.5665, 126.9780);
        }
    }

    getLocationAndInitializeWeatherWidget();
    
    document.getElementById('w_schedule').addEventListener('click', function() {
        document.getElementById('schedule-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('closeSchedule').addEventListener('click', function() {
        document.getElementById('schedule-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    document.getElementById('w_calendar').addEventListener('click', function() {
        console.log("캘린더 모달 열림");
        document.getElementById('calendar-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('closeCalendar').addEventListener('click', function() {
        console.log("캘린더 모달 닫힘");
        document.getElementById('calendar-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    document.getElementById('w_calendar').addEventListener('click', function() {
        document.getElementById('iframe').src = 'calendar/calendar.html'; // 새 HTML 파일 경로
        document.getElementById('iframe-container').style.display = 'block';
    });
    
    document.getElementById('w_friendSchedule').addEventListener('click', function() {
        document.getElementById('f_schedule-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('f_closeSchedule').addEventListener('click', function() {
        document.getElementById('f_schedule-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    document.getElementById('add-event-button').addEventListener('click', function() {
        document.getElementById('add-event-form').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });

    document.getElementById('close-add-event-button').addEventListener('click', function() {
        document.getElementById('add-event-form').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });
    
    document.getElementById('open-weather-modal').addEventListener('click', function(){
        document.getElementById('weather-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });

    document.getElementById('close-weather-modal').addEventListener('click', function(){
        document.getElementById('weather-modal').style.display = 'none';
        document.getElementById('modal-background').style.display = 'none';
    });

    $("#event-start-date-display").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            $("#event-start-date").val(dateText);
            $(this).val(dateText);
            $("#event-end-date-display").datepicker("option", "minDate", dateText);
        }
    });

    $("#event-end-date-display").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            $("#event-end-date").val(dateText);
            $(this).val(dateText);
        }
    });

    document.getElementById('save-add-event-button').addEventListener('click', function() {
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

    $(document).ready(function() {
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

        $('#create-room-button').click(function() {
            const roomNumber = Math.floor(1000 + Math.random() * 9000);
            alert('방 번호: ' + roomNumber);
            isRoomOwner = true;
            joinRoom(roomNumber, true);
            socket.emit('createRoom', { room: roomNumber, userID: userID });
            localStorage.setItem('currentRoom', roomNumber); // 방 정보 저장
            localStorage.setItem('isRoomOwner', true); // 방 생성자 정보 저장
        });

        $('#join-room-button').click(function() {
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

        $('#send-message-button').click(function() {
            sendMessage();
        });

        $('#chat-input').keyup(function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        $('#delete-room-button').click(function() {
            if (confirm('정말로 방을 삭제하시겠습니까?')) {
                socket.emit('deleteRoom', { room: currentRoom, userID: userID });
                localStorage.removeItem('currentRoom'); // 방 정보 삭제
                localStorage.removeItem('isRoomOwner'); // 방 생성자 정보 삭제
            }
        });

        $('#leave-room-button').click(function() {
            if (confirm('정말로 방을 나가시겠습니까?')) {
                socket.emit('leaveRoom', { room: currentRoom, userID: userID });
                localStorage.removeItem('currentRoom'); // 방 정보 삭제
                localStorage.removeItem('isRoomOwner'); // 방 생성자 정보 삭제
            }
        });

        socket.on('roomDeleted', function() {
            alert('방이 삭제되었습니다.');
            resetChat();
            closeChatModal();
        });

        socket.on('leftRoom', function() {
            alert('방을 나갔습니다.');
            resetChat();
            closeChatModal();
        });

        socket.on('message', function(data) {
            addMessage(data.userID, data.message, 'received', data.timestamp);
        });

        socket.on('previousMessages', function(messages) {
            $('#chat-messages').empty(); // 중복 방지를 위해 채팅 기록 초기화
            $('#chat-messages-widget').empty(); // 중복 방지를 위해 채팅 기록 초기화
            messages.forEach(message => {
                addMessage(message.userID, message.message, 'received', message.timestamp);
            });
        });

        function joinRoom(roomNumber, isOwner) {
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
            `);

            $('#send-message-button-widget').click(function() {
                sendMessage();
            });

            $('#chat-input-widget').keyup(function(event) {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            });

            $('#w_chat').click(openChatModal);
        }

        function sendMessage() {
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

        function addMessage(userID, text, type, timestamp) {
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

        function hideRoomJoinElements() {
            $('#room-number-input').hide();
            $('#join-room-button').hide();
            $('#create-room-button').hide();
        }

        function showRoomJoinElements() {
            $('#room-number-input').show();
            $('#join-room-button').show();
            $('#create-room-button').show();
        }

        function resetChat() {
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

        function updateChatWidgetSize() {
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

        $(".widget").draggable({
            //containment: "parent", // 부모 요소 내에서만 드래그 가능
            stack: ".widget", // 위젯들이 겹치지 않도록 설정
            stop: function(event, ui) {
                saveWidgetPosition(this);
            }
        });

        // 위젯 리사이즈 핸들러 추가
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
