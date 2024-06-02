<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>

<%
    request.setCharacterEncoding("UTF-8");
    String id = request.getParameter("id");

    Connection conn = null;
    PreparedStatement pstmt = null;
    PreparedStatement eventPstmt = null;
    
    String url = "jdbc:mysql://localhost:3306/ScheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root"; // MySQL 사용자
    String dbPassword = "1234"; // MySQL 비밀번호

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);

        String sql = "DELETE FROM schedules WHERE id = ?";
        pstmt = conn.prepareStatement(sql);
        pstmt.setInt(1, Integer.parseInt(id));
        pstmt.executeUpdate();
		
        String eventSql = "DELETE FROM event WHERE id = ?";
        eventPstmt = conn.prepareStatement(eventSql);
        eventPstmt.setInt(1, Integer.parseInt(id));
        eventPstmt.executeUpdate();
        
        response.sendRedirect("mainPage.jsp");

    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        if(pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if(eventPstmt != null) try { eventPstmt.close(); } catch (SQLException e) {}
        if(conn != null) try { conn.close(); } catch (SQLException e) {}
    }
%>
