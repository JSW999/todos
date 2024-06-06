<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, java.util.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page import="java.time.LocalDate" %>

<%
	request.setCharacterEncoding("UTF-8");
   // 유저 로그인 시 userID값 가져오기
    String userID = (String) session.getAttribute("userID");
	String userToken = (String) session.getAttribute("userToken");

   if(userID == null) {
      %>
         <script>
         alert("로그인이 필요합니다!");
         location.href = "http://localhost:8080/todos/auth/login.html";         
         </script>
         
      <%
   }
   
   // 다른 사용자 일정 받아오기(일정 리스트, 총합, 오늘 할 일)
   List<Map<String, Object>> friendSchedules = (List<Map<String, Object>>) session.getAttribute("friendSchedules");
   int friendTotalTasks = (session.getAttribute("friendTotalTasks") != null) ? (int) session.getAttribute("friendTotalTasks") : 0;
   int friendTodayTasks = (session.getAttribute("friendTodayTasks") != null) ? (int) session.getAttribute("friendTodayTasks") : 0;

   // 데이터베이스 연결(내 일정 받아오기)
   Connection conn = null;
   
   Statement stmtSchedules = null;
   Statement stmtTotalTasks = null;
   Statement stmtTodayTaks = null;
   
   ResultSet rsTotalTasks = null;
   ResultSet rsTodayTasks = null;
   ResultSet rsSchedules = null;
   
   String url = "jdbc:mysql://localhost:3306/ScheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
   String dbUser = "root"; // MySQL 사용자
   String dbPassword = "1234"; // MySQL 비밀번호
	
   // do List 위젯의 내용에 들어갈 전체 할 일, 오늘 할 일 개수 
   int myTotalTasks = 0;
   int myTodayTasks = 0;
   
   try {
       Class.forName("com.mysql.cj.jdbc.Driver");
       conn = DriverManager.getConnection(url, dbUser, dbPassword);
		
       stmtSchedules = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
       stmtTotalTasks = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
       stmtTodayTaks = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
       
       // 일정 데이터 가져오기
       String sql = "SELECT id, title, start_date, end_date FROM schedules WHERE userToken = '" + userToken + "'" +
       				" UNION ALL " +
    		   		"SELECT id, title, start_date, end_date FROM event WHERE userToken = '" + userToken + "'" + 
       				" ORDER BY start_date";
       rsSchedules = stmtSchedules.executeQuery(sql);
        
        List<Map<String, Object>> schedules = new ArrayList<>();
        while (rsSchedules.next()) {
            Map<String, Object> schedule = new HashMap<>();
            schedule.put("id", rsSchedules.getInt("id"));
            schedule.put("title", rsSchedules.getString("title"));
            schedule.put("start_date", rsSchedules.getDate("start_date"));
            schedule.put("end_date", rsSchedules.getDate("end_date"));
            schedules.add(schedule);
        }
        session.setAttribute("schedules", schedules);

    // 일정 totalTasks 값 (전체일정)
       String totalTasksQuery = "SELECT COUNT(*) AS total FROM (SELECT id FROM schedules WHERE userToken = '" + userToken + "'" +
                                " UNION ALL " +
                                "SELECT id FROM event WHERE userToken = '" + userToken + "') AS combined";
        rsTotalTasks = stmtTodayTaks.executeQuery(totalTasksQuery);
        if (rsTotalTasks.next()) {
            myTotalTasks = rsTotalTasks.getInt("total");
        }
       
        // 일정 todayTasks 값 (오늘일정)
        String todayDate = LocalDate.now().toString();
        String todayTasksQuery = "SELECT COUNT(*) AS today FROM (SELECT id FROM schedules WHERE userToken = '" + userToken + 
        						  "' AND start_date <= '" + todayDate + "' AND end_date >= '" + todayDate + "'" +
        						 " UNION ALL " +
        						 "SELECT id FROM event WHERE userToken = '" + userToken + "' AND start_date <= '" + todayDate + 
        						 "' AND end_date >= '" + todayDate + "') AS combined";

        rsTodayTasks = stmtSchedules.executeQuery(todayTasksQuery);
        if (rsTodayTasks.next()) {
            myTodayTasks = rsTodayTasks.getInt("today");
        }
        
   } catch (Exception e) {
       e.printStackTrace();
   } finally {
       if(rsTotalTasks != null) try { rsTotalTasks.close(); } catch (SQLException e) {}
       if(rsTodayTasks != null) try { rsTodayTasks.close(); } catch (SQLException e) {}
       if(rsSchedules != null) try { rsSchedules.close(); } catch (SQLException e) {}
       
       if(stmtSchedules != null) try { stmtSchedules.close(); } catch (SQLException e) {}
       if(stmtTotalTasks != null) try { stmtTotalTasks.close(); } catch (SQLException e) {}
       if(stmtTodayTaks != null) try { stmtTodayTaks.close(); } catch (SQLException e) {}
       
       if(conn != null) try { conn.close(); } catch (SQLException e) {}
   }

   %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    
    
    <link rel="stylesheet" href="mainPage.css?v=1.0">
    <link href="main.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.1.3/socket.io.js"></script>
    
    <!-- 채팅방 사용자 userID 값 가져오기 -->
    <script>var userID = "<%= (String) session.getAttribute("userID") %>";</script>
</head>
<body>
	
    <div class="dashboard">
    	<!-- 대문 -->
        <h1>Welcome back <span><%= userID %></span>
        <span style="font-size:20px">토큰: <%= userToken %></span></h1>
        <a href="logout.jsp" class="logout-btn">로그아웃</a>
        
        <!-- 위젯 모음 -->
        <div class="widgets">
        	<!-- 내 일정 리스트 위젯 -->
            <div class="do List widget" id="widget1">
                <p class="label">할 일</p>
                <p class="values">
                    <p>전체 할 일: <%= myTotalTasks %>개</p>
                    <p>오늘 할 일: <%= myTodayTasks %>개</p>
                </p>
                <div class="icon" id="w_schedule">></div>
                <div class="resize-handle"></div>
            </div>
            
            <!-- 캘린더 위젯 -->
            <div class="calendar widget" id="widget2">
                <p class="label">캘린더</p>
                <div id="calendar"></div>
                <div class="icon" id="w_calendar">></div>
                <div class="resize-handle"></div>
            </div>
            
            <!-- 다른 사용자 할 일 리스트 -->
           <div class="friends Do List widget" id="widget3">
                <p class="label">다른 사용자 할 일 </p>
                <p class="values">
                	<p>전체 할 일: <span id="friendTotalTasks"><%= friendTotalTasks %></span>개</p>
        			<p>오늘 할 일: <span id="friendTodayTasks"><%= friendTodayTasks%></span>개</p>
                </p>
                <div class="icon" id="w_friendSchedule">></div>
                <div class="resize-handle"></div>
            </div>
            
            <!-- 채팅 위젯 -->
            <div class="chat widget" id="widget4">
                <p class="label">채팅</p>
                <div class="values" id="chat-values">
                    <div class="icon" id="w_chat">></div>
                    <div id="chat-room-widget" style="display: none;">
				        <div id="chat-messages-widget" style="height: 100px; overflow-y: auto;"></div>
				        <input type="text" id="chat-input-widget" placeholder="메시지를 입력하세요">
				        <button id="send-message-button-widget">보내기</button>
                	</div>
                </div>
                <div class="resize-handle"></div>
            </div>
            
            <!-- 날씨 위젯 -->
            <div class="weather widget" id="widget5">
               <div class="label">날씨</div>
                <div class="values">
                    <img id="weather-icon" src="" alt="Weather Icon">
                    <span id="temperature"></span>
                    <span id="location"></span>
                </div>
                <div class="icon" id="open-weather-modal">></div>
                <div class="resize-handle"></div>
            </div>
            
            <!-- 아래서 부턴 미구현 위젯 -->
            <div class="gptVoice widget" id="widget6">
                <p class="label">인공지능 대화</p>
                <div class="icon" id="gptVoice-modal">></div>
                <div class="resize-handle"></div>
            </div>
            
            <div class="widget 7" id="widget7">
                <p class="label">위젯7</p>
                <p class="values">내용</p>
                <div class="icon" onclick="openModal()">></div>
                <div class="resize-handle"></div>
            </div>
            
            <div class="widget 8" id="widget8">
                <p class="label">위젯8</p>
                <p class="values">내용</p>
                <div class="icon" onclick="openModal()">></div>
                <div class="resize-handle"></div>
            </div>
            <!-- 위젯 끝 -->
        </div>
    </div>
    
    <!-- 내 일정 리스트 모달 --> 
    <div id="modal-background" class="modal-background"></div>
    <div id="schedule-modal" class="modal">
        <div class="modal-content">
            <span id="closeSchedule" class="close">&times;</span> <!-- 모달 닫기 -->
            <button id="add-event-button">일정 추가</button>
            <!-- 일정 추가 버튼 누르면 나오는 레이어 -->
            <div id="add-event-form">
		        <input type="text" id="event-title" placeholder="일정 제목" required>
		        <input type="text" id="event-start-date-display" placeholder="일정 시작" readonly>
		        <input type="date" id="event-start-date" style="display: none;" required>
		        <input type="text" id="event-end-date-display" placeholder="일정 종료" readonly>
		        <input type="date" id="event-end-date" style="display: none;" required> 
		        <button id="save-add-event-button">저장</button>
		        <button id="close-add-event-button">닫기</button>
		    </div>
		    
		    <!-- 추가한 일정 값을 받아와 출력 -->
            <h3>추가된 일정</h3>
            <div id="schedule-list-modal">
               <%
               	// 리스트에 저장한 내 일정 가져오기
			    List<Map<String, Object>> schedules = (List<Map<String, Object>>) session.getAttribute("schedules");
			    if (schedules != null) {
			        for (Map<String, Object> schedule : schedules) {
			            int id = (int) schedule.get("id"); 
			            String title = (String) schedule.get("title"); // 일정 제목
			            java.sql.Date start_date = (java.sql.Date) schedule.get("start_date"); // 일정 시작 날짜
			            java.sql.Date end_date = (java.sql.Date) schedule.get("end_date"); // 일정 종료 날짜
			    %>
                <!-- date, time, title 출력 -->
                <div class="schedule-item-modal">
                    <p><%= start_date %> / <%= end_date %> - <%= title %></p>
                    <!-- 일정 삭제 (데이터베이스 값도 같이 삭제) -->
                    <form action="deleteSchedule.jsp" method="post" style="display:inline;">
                        <input type="hidden" name="id" value="<%= id %>">
                        <button type="submit">삭제</button>
                    </form>
                </div>
				<%
			        }
			    }
			    %>
        	</div>
        </div>
    </div>
    
    <!-- 다른 사용자 일정 모달 -->
    <div id="modal-background" class="modal-background"></div>
    <div id="f_schedule-modal" class="modal">
	    <div class="modal-content">
	        <span id="f_closeSchedule" class="close">&times;</span>  <!-- 모달 닫기 -->
	           
	        <h2>사용자 토큰 입력</h2>
	        <!-- 유저 토큰 입력으로 다른 사용자 일정 가져오기 -->
	        <form method="GET" action="friendSchedule/fetchFriendSchedule.jsp">
	            <label for="friendUserToken">User Token:</label>
	            <input type="text" id="friendUserToken" name="friendUserToken" required>
	            <button type="submit">확인</button>
        	</form>
        	
        	<!-- 다른 사용자 일정 삭제 -->
        	<form method="GET" action="friendSchedule/deleteFriendSchedule.jsp">
	            <input type="hidden" id="friendUserToken" name="friendUserToken" value="<%= request.getParameter("friendUserToken") %>">
	            <button type="submit">삭제</button>
       		</form>
       		
	        <h2>추가된 일정</h2>
	        <div id="friend-schedule-list-modal"> 
            <%
            // friendSchedules 리스트에서 다른 사용자 일정 가져오기
            if (friendSchedules != null) {
                for (Map<String, Object> friendSchedule : friendSchedules) {
                    int id = (int) friendSchedule.get("id");
                    String title = (String) friendSchedule.get("title"); // 일정 제목
                    java.sql.Date start_date = (java.sql.Date) friendSchedule.get("start_date"); // 일정 시작 날짜
                    java.sql.Date end_date = (java.sql.Date) friendSchedule.get("end_date"); // 일정 종료 날짜
            %>
	             
	            <!-- date, time, title 출력 -->
	            <div class="schedule-item-modal">
	                <p><%= start_date %> / <%= end_date %> - <%= title %></p>
	            </div>
	            <%
	                }
	            }
	            %>
	        </div>
	    </div>
	</div>
    
    <!-- 캘린더 모달 -->
    <div id="modal-background" class="modal-background"></div>
	<div id="calendar-modal" class="modal">
        <div class="modal-content">
            <span id="closeCalendar" class="close">&times;</span> <!-- 모달 닫기 -->

            <h2>캘린더</h2>
            <div id="iframe-container" style="display: none; height: 680px;">
            	<!-- calendar 폴더의 calendar.html 받아오기 -->
        		<iframe id="iframe" src="" style="width: 100%; height: 80%; border: none;"></iframe>
    		</div>
        </div>
    </div>
    
    <!-- 채팅 모달 -->
    <div class="modal-background" id="modal-background"></div>
    <div class="modal" id="chat-modal">
        <span class="close" id="close-chat-modal">&times;</span> <!-- 모달 닫기 -->
        <div class="modal-content">
            <h2>n:n 채팅방</h2>
            <div> <!-- 채팅방 기능 -->
                <button id="create-room-button">방 만들기</button>
                <button id="delete-room-button" style="display:none;">방 삭제</button>
    			<button id="leave-room-button" style="display:none;">방 나가기</button>
                <input type="text" id="room-number-input" placeholder="방 번호 입력">
                <button id="join-room-button">방 참가</button>
            </div>
            <!-- 채팅치는 레이어 -->
            <div id="chat-room" style="display:none;">
                <div id="chat-messages" style="height: 400px; overflow-y: auto;"></div>
                <input type="text" id="chat-input" placeholder="메시지를 입력하세요">
                <button id="send-message-button">보내기</button>
            </div>
        </div>
    </div>
    
    <div id="modal-background" class="modal-background"></div>
    <!-- 날씨 모달 -->
    <div id="weather-modal" class="modal">
        <div class="modal-content">
            <span class="close" id="close-weather-modal">&times;</span> <!-- 모달 닫기 -->
            <h2>날씨 정보</h2>
            <div>
                <img id="modal-weather-icon" src="" alt="Weather Icon"> <!-- 날씨 아이콘 -->
                <span id="modal-temperature"></span> <!-- 날씨 온도 -->
                <span id="modal-location"></span> <!-- 지역 -->
            </div>
            <h3>시간별 날씨</h3>
            <div id="hourly-forecast" class="forecast-container"></div> <!-- 3시간마다 날씨 정보 -->
            <h3>5일간 날씨 </h3>
            <div id="five-day-forecast" class="forecast-container"></div> <!-- 5일간 날씨 정보 -->
        </div>
    </div>
    
    <div id="modal-background" class="modal-background"></div>
	<div id="voice-modal" class="modal">
        <div class="modal-content">
            <span id="closeVoice" class="close">&times;</span> <!-- 모달 닫기 -->
            <h1>Voice to GPT</h1>
		    <button id="startRecording">Start Recording</button>
		    <button id="stopRecording" disabled>Stop Recording</button>
		    <div id="response"></div>
        </div>
    </div>
    
    <script src="gptVoice.js?v=1.0"></script>
    <script src="mainPage.js?v=1.0"></script>
    <script src="main.js"></script>
    <script src="locales-all.js"></script>
    <script>

    </script>
</body>
</html>
