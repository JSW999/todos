<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>

<%
	// calendar.html에서 값을 받아옴
    String title = request.getParameter("title");
    String startDate = request.getParameter("start_date");
    String endDate = request.getParameter("end_date");
	String userToken = (String) session.getAttribute("userToken");
	
    Connection conn = null;
    PreparedStatement pstmt = null;
    String url = "jdbc:mysql://localhost:3306/scheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root"; // MySQL 사용자
    String dbPassword = "1234"; // MySQL 비밀번호

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);
        
        // 받아온 값 db에 저장하는 쿼리
        String sql = "INSERT INTO event (title, start_date, end_date, userToken) VALUES (?, ?, ?, ?)";
        pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, title);
        pstmt.setString(2, startDate);
        pstmt.setString(3, endDate);
        pstmt.setString(4, userToken);
        pstmt.executeUpdate();

        out.print("success"); // 성공 시 success 출력
    } catch (Exception e) {
        e.printStackTrace();
        out.print("error");
    } finally {
        if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
%>