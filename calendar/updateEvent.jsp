<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>

<%
    String eventId = request.getParameter("id");
    String title = request.getParameter("title");
    String startDate = request.getParameter("start_date");
    String endDate = request.getParameter("end_date");
    String details = request.getParameter("details");

    Connection conn = null;
    PreparedStatement pstmt = null;
    
    PreparedStatement schedulesPstmt = null;
    
    String url = "jdbc:mysql://localhost:3306/scheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = ""; // MySQL 사용자
    String dbPassword = ""; // MySQL 비밀번호

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);
        
        String eventSql = "UPDATE event SET title = ?, start_date = ?, end_date = ?, details = ? WHERE id = ?";
        pstmt = conn.prepareStatement(eventSql);
        pstmt.setString(1, title);
        pstmt.setString(2, startDate);
        pstmt.setString(3, endDate);
        pstmt.setString(4, details);
        pstmt.setInt(5, Integer.parseInt(eventId));
        pstmt.executeUpdate();
		
        String schedulesSql = "UPDATE schedules SET title = ?, start_date = ?, end_date = ?, details = ? WHERE id = ?";
        schedulesPstmt = conn.prepareStatement(schedulesSql);
        schedulesPstmt.setString(1, title);
        schedulesPstmt.setString(2, startDate);
        schedulesPstmt.setString(3, endDate);
        schedulesPstmt.setString(4, details);
        schedulesPstmt.setInt(5, Integer.parseInt(eventId));
        schedulesPstmt.executeUpdate();
        
        out.print("success");
    } catch (Exception e) {
        e.printStackTrace();
        out.print("error");
    } finally {
        if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
        
        if (schedulesPstmt != null) try { schedulesPstmt.close(); } catch (SQLException e) {}
    }
%>
