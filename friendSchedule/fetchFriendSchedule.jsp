<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, java.util.*, javax.servlet.http.*, java.time.*" %>
<%
	// 친구의 userToken 값을 받아와 해당 유저 토큰과 일치한 정보를 session(friendSchedules)에 저장
    String friendUserToken = request.getParameter("friendUserToken");
	session.setAttribute("friendUserToken", friendUserToken);

	
    Connection conn = null;
    Statement stmtF_Schedules = null;
    ResultSet rsF_Schedules = null;

    Statement stmtF_TotalTasks = null;
    ResultSet rsF_TotalTasks = null;
    
    Statement stmtF_TodayTaks = null;
    ResultSet rsF_TodayTasks = null;
    
    
    String url = "jdbc:mysql://localhost:3306/scheduledb?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "";
    String dbPassword = "";

    
    // 친구 일정의 총합, 오늘 할 일 개수 
    int friendTotalTasks = 0;
    int friendTodayTasks = 0;

    if (friendUserToken != null && !friendUserToken.isEmpty()) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(url, dbUser, dbPassword);
            
            stmtF_Schedules = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY); 
            
            // 친구 일정 정보 가져오는 쿼리
            String fetchSql = "SELECT id, title, start_date, end_date FROM schedules WHERE userToken = '" + friendUserToken + "'" +
            				  " UNION ALL " +
            				  "SELECT id, title, start_date, end_date FROM event WHERE userToken = '" + friendUserToken + "'";
            rsF_Schedules = stmtF_Schedules.executeQuery(fetchSql);
            

            // 리스트에 저장
            List<Map<String, Object>> friendSchedules = new ArrayList<>();
            while (rsF_Schedules.next()) {
                Map<String, Object> friendSchedule = new HashMap<>();
                friendSchedule.put("id", rsF_Schedules.getInt("id"));
                friendSchedule.put("title", rsF_Schedules.getString("title"));
                friendSchedule.put("start_date", rsF_Schedules.getDate("start_date"));
                friendSchedule.put("end_date", rsF_Schedules.getDate("end_date"));
                friendSchedules.add(friendSchedule);
            }
			
            session.setAttribute("friendSchedules", friendSchedules); // 리스트 값을 session에 저장
			
            // 친구 일정의 총 합, 오늘 할 일 개수 가져오는 쿼리
            String totalTasksSql = "SELECT COUNT(*) AS totalTasks FROM (SELECT id FROM schedules WHERE userToken = '" + friendUserToken + "'" +
			                       " UNION ALL " +
			                       "SELECT id FROM event WHERE userToken = '" + friendUserToken + "') AS combined";
            stmtF_TotalTasks = conn.prepareStatement(totalTasksSql);

            rsF_TotalTasks = stmtF_TotalTasks.executeQuery(totalTasksSql);
            if (rsF_TotalTasks.next()) {
                friendTotalTasks = rsF_TotalTasks.getInt("totalTasks");
            }
			
            String todayDate = LocalDate.now().toString();
            String todayTasksSql = "SELECT COUNT(*) AS todayTasks FROM (SELECT id FROM schedules WHERE userToken = '" + friendUserToken + 
								   "' AND start_date <= '" + todayDate + "' AND end_date >= '" + todayDate + "'" +
								   " UNION ALL " +
								   "SELECT id FROM event WHERE userToken = '" + friendUserToken + "' AND start_date <= '" + todayDate + 
								   "' AND end_date >= '" + todayDate + "') AS combined";
            
            stmtF_TodayTaks = conn.prepareStatement(todayTasksSql);
            
            rsF_TodayTasks = stmtF_TodayTaks.executeQuery(todayTasksSql);
            if (rsF_TodayTasks.next()) {
                friendTodayTasks = rsF_TodayTasks.getInt("todayTasks");
                
            }
			
            // 총 합, 오늘 할 일 개수를 세션에 저장
            session.setAttribute("friendTotalTasks", friendTotalTasks);
            session.setAttribute("friendTodayTasks", friendTodayTasks);
            

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (rsF_Schedules != null) try { rsF_Schedules.close(); } catch (SQLException e) {}
            if (stmtF_Schedules != null) try { stmtF_Schedules.close(); } catch (SQLException e) {}
            
            if(stmtF_TotalTasks != null) try { stmtF_TotalTasks.close(); } catch (SQLException e) {}
            if(rsF_TotalTasks != null) try { rsF_TotalTasks.close(); } catch (SQLException e) {}
            
            if(stmtF_TodayTaks != null) try { stmtF_TodayTaks.close(); } catch (SQLException e) {}
            if(rsF_TodayTasks != null) try { rsF_TodayTasks.close(); } catch (SQLException e) {}
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
        }
    }

    response.sendRedirect("../mainPage.jsp");
%>
