<%@ page language="java" contentType="application/json; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>

<%
	// userToken 값을 받아와 일치한 정보를 db에서 찾기
	String userToken = (String) session.getAttribute("userToken");
    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;
    String url = "jdbc:mysql://localhost:3306/scheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root"; // MySQL 사용자
    String dbPassword = "1234"; // MySQL 비밀번호

    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);
        
        stmt = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
        
        // event, schedules 테이블에서 userToken 값과 일치한 정보 선택 쿼리
        String sql = "SELECT id, title, start_date, end_date FROM event WHERE userToken = '" + userToken + "'" + 
        			 " UNION " + 
        			 "SELECT id, title, start_date, end_date FROM schedules WHERE userToken = '" + userToken + "'";

        rs = stmt.executeQuery(sql);

        out.print("[");
        boolean first = true;
        while (rs.next()) {
            if (!first) {
                out.print(",");
            }
            out.print("{");
            out.print("\"id\": \"" + rs.getInt("id") + "\",");
            out.print("\"title\": \"" + rs.getString("title") + "\",");
            out.print("\"start\": \"" + rs.getString("start_date") + "\",");
            out.print("\"end\": \"" + rs.getString("end_date") + "\"");
            out.print("}");
            first = false;
        }
        out.print("]");
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        if (rs != null) try { rs.close(); } catch (SQLException e) {}
        if (stmt != null) try { stmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
%>