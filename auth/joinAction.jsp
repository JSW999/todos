<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*, java.util.UUID" %>
<%@ page import="org.mindrot.jbcrypt.BCrypt" %>

<%! 
    // 비밀번호를 해싱하는 메소드
    String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
%>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Join Action</title>
</head>
<body>
    <%
        String userID = request.getParameter("userID");
        String userPassword = request.getParameter("userPassword");  
        String userEmail = request.getParameter("userEmail");
        
        String userToken = UUID.randomUUID().toString();
        
        String hashedPassword = hashPassword(userPassword);
        
        String dbURL = "jdbc:mysql://localhost:3306/user"; // 데이터베이스 URL 수정 필요
        String dbUser = ""; // 데이터베이스 사용자명 수정 필요
        String dbPassword = ""; // 데이터베이스 비밀번호 수정 필요

        Connection conn = null;
        PreparedStatement pstmt = null;
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(dbURL, dbUser, dbPassword);

            String sql = "INSERT INTO user (userID, userPassword, userEmail, userToken) VALUES (?, ?, ?, ?)";
            pstmt = conn.prepareStatement(sql);
            
            
            pstmt.setString(1, userID);
            pstmt.setString(2, hashedPassword);
            pstmt.setString(3, userEmail);
            pstmt.setString(4, userToken);
            
         int rows = pstmt.executeUpdate();
         
         if (rows > 0) {
            %>
            <script>
            alert("회원가입에 성공하셨습니다!");
            location.href = "http://localhost:8080/todos/auth/login.html";
            </script>
            <%
         } else {
            %>
            <script>
            alert("회원가입에 실패하셨습니다.");
            </script>
            <%
         }
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (pstmt != null) {
                try {
                    pstmt.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        } 
        
    %>
</body>
</html>
