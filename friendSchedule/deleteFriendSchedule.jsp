<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, java.util.*, javax.servlet.http.*" %>

<%
    String friendUserToken = request.getParameter("friendUserToken");

    Connection conn = null;
    PreparedStatement pstmt = null;

    String url = "jdbc:mysql://localhost:3306/scheduledb?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root";
    String dbPassword = "1234";
	
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