<%@ page import="java.sql.*" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String eventId = request.getParameter("id");

    // 데이터베이스 연결 정보
    String dbURL = "jdbc:mysql://localhost:3306/scheduleDB?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    String dbUser = "root"; // 데이터베이스 사용자 이름
    String dbPassword = "1234"; // 데이터베이스 비밀번호

    Connection conn = null;
    PreparedStatement pstmt = null;
    PreparedStatement schedulesPstmt = null;

    try {
        // 데이터베이스 연결
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(dbURL, dbUser, dbPassword);

        // SQL 쿼리 작성 및 실행 (event 테이블)
        String sql = "DELETE FROM event WHERE id = ?";
        pstmt = conn.prepareStatement(sql);
        pstmt.setInt(1, Integer.parseInt(eventId));

        // event 테이블에서 삭제 시도
        int rows = pstmt.executeUpdate();

        if (rows > 0) {
            out.print("success");
            System.out.print("rows-success");
        } else {
            // event 테이블에서 삭제되지 않았다면 schedules 테이블에서 삭제 시도
            String schedulesSql = "DELETE FROM schedules WHERE id = ?";
            schedulesPstmt = conn.prepareStatement(schedulesSql);
            schedulesPstmt.setInt(1, Integer.parseInt(eventId));

            int schedulesRows = schedulesPstmt.executeUpdate();

            if (schedulesRows > 0) {
                out.print("success");
                System.out.print("success");
            } else {
                out.print("failure");
                System.out.print("failure");
            }
        }
        
    } catch (Exception e) {
        e.printStackTrace();
        out.print("error");
    } finally {
        // 자원 해제
        if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
        if (schedulesPstmt != null) try { schedulesPstmt.close(); } catch (SQLException e) {}
        if (conn != null) try { conn.close(); } catch (SQLException e) {}
    }
%>
