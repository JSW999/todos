<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>

<%
    String eventId = request.getParameter("id");

    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    String url = "jdbc:mysql://localhost:3306/scheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root"; // MySQL 사용자
    String dbPassword = "1234"; // MySQL 비밀번호

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);
        
        String sql = "SELECT details FROM event WHERE id = ?" + 
        			 " UNION " +
        			 "SELECT details FROM schedules WHERE id = ?";
        pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, eventId);
        pstmt.setString(2, eventId);
        rs = pstmt.executeQuery();

        if (rs.next()) {
            String details = rs.getString("details");
            // JSON 형식으로 응답을 작성합니다.
            out.print("{\"details\": \"" + details + "\"}");
        }
    } catch (Exception e) {
        e.printStackTrace();
        out.print("{\"details\": \"\"}");
    } finally {
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
%>