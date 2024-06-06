<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page import="org.json.simple.JSONObject" %>

<%  // schedule db의 schedules 테이블에 입력한 일정 저장
	request.setCharacterEncoding("UTF-8");
	response.setContentType("text/plain");
	response.setCharacterEncoding("UTF-8");
	
    String userID = (String) session.getAttribute("userID");
    String title = request.getParameter("title");
    String start_date = request.getParameter("start_date");
    String end_date = request.getParameter("end_date");
    String userToken = (String) session.getAttribute("userToken");
    
    if(userID == null) {
        response.sendRedirect("http://localhost:8080/todos/auth/login.html");
        return;
    }


    Connection conn = null;
    PreparedStatement pstmt = null;
    String url = "jdbc:mysql://localhost:3306/ScheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root";
    String dbPassword = "1234";

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);

        String sql = "INSERT INTO schedules (userID, title, start_date, end_date, userToken) VALUES (?, ?, ?, ?, ?)";
        pstmt = conn.prepareStatement(sql);
        pstmt.setString(1, userID);
        pstmt.setString(2, title);
        pstmt.setString(3, start_date);
        pstmt.setString(4, end_date);
        pstmt.setString(5, userToken);
        pstmt.executeUpdate();

        response.getWriter().write("success");  // 성공시 success 출력
		
    } catch (Exception e) {
    	response.getWriter().write("fail");
        e.printStackTrace();
    } finally {
        if(pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if(conn != null) try { conn.close(); } catch (SQLException e) {}
    }
    
%>
