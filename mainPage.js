// 페이지 로드 시 저장된 위젯 크기를 설정
document.addEventListener('DOMContentLoaded', function() {
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
    
   // 위젯 사이즈 조절 
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

    // 위젯 크기 저장 함수
    function saveWidgetSize(widget) {
        const id = widget.id;
        const width = widget.style.width;
        const height = widget.style.height;

        localStorage.setItem(`${id}-width`, width);
        localStorage.setItem(`${id}-height`, height);
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
});


document.addEventListener('DOMContentLoaded', function() {
	
	document.getElementById('w_schedule').addEventListener('click', function() {
        document.getElementById('schedule-modal').style.display = 'block';
        document.getElementById('modal-background').style.display = 'block';
    });
    
    document.getElementById('closeSchedule').addEventListener('click', function() {
        document.getElementById('schedule-modal').style.display = 'none';
    	document.getElementById('modal-background').style.display = 'none';
    });
    // 캘린더 모달 열기
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
    
    // 캘린더 모달 안의 콘텐츠 - calendar.html iframe
   document.getElementById('w_calendar').addEventListener('click', function() {
        document.getElementById('iframe').src = 'calendar/calendar.html'; // 새 HTML 파일 경로
        document.getElementById('iframe-container').style.display = 'block';
    });
	
	// 다른 사용자 일정 모달 열기
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
    
    $("#event-start-date-display").datepicker({
		dateFormat: "yy-mm-dd",
		onSelect: function(dateText) {
			$("#event-start-date").val(dateText);
			$(this).val(dateText);
			$("#event-end-date-display").datepicker("option", "minDate", dateText);
		}
	});

	// 일정 종료 datepicker
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
});


