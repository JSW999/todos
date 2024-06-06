<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, java.util.*, javax.servlet.http.*" %>

<% 
	// 친구의 userToken 값을 받아와 일치한 정보를 다른 사용자 할 일에서 제거 
    String friendUserToken = request.getParameter("friendUserToken");

    Connection conn = null;
    PreparedStatement pstmt = null;

    String url = "jdbc:mysql://localhost:3306/scheduledb?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "";
    String dbPassword = "";
	
    if (friendUserToken != null && !friendUserToken.isEmpty()) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(url, dbUser, dbPassword);

            String delSchedulesSql = "DELETE FROM schedules WHERE userToken = ?";
            pstmt = conn.prepareStatement(delSchedulesSql);
            pstmt.setString(1, friendUserToken);
            pstmt.executeUpdate();
			
            String delEventSql = "DELETE FROM event WHERE userToken = ?";
            pstmt = conn.prepareStatement(delEventSql);
            pstmt.setString(1, friendUserToken);
            pstmt.executeUpdate();
            
            // 사용했던 세션 제거
            session.removeAttribute("friendSchedules");
            session.removeAttribute("friendTotalTasks");
            session.removeAttribute("friendTodayTasks");
			
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
            if (conn != null) try { conn.close(); } catch (SQLException e) {}
        }
    }

    response.sendRedirect("../mainPage.jsp");
%>
