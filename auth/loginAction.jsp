<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%@ page import="org.mindrot.jbcrypt.BCrypt" %>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type"   content="text/html; charset=UTF-8">
<title>Login Action</title>
</head>
<body>
   <%
   String userID = request.getParameter("userID");
   String userPassword = request.getParameter("userPassword");
   String userToken = null;
   
   String dbURL = "jdbc:mysql://localhost:3306/user?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
   String dbUser = "";
   String dbPassword = "";
   
   Connection conn = null;
   PreparedStatement pstmt = null;
   ResultSet rs = null;
   
   try {
      Class.forName("com.mysql.cj.jdbc.Driver");
      conn = DriverManager.getConnection(dbURL, dbUser, dbPassword);
      
      String sql = "SELECT * FROM user WHERE userID=?";
      pstmt = conn.prepareStatement(sql);
      pstmt.setString(1, userID);
      rs = pstmt.executeQuery();

      if (rs.next()) {
         String storedHashedPassword = rs.getString("userPassword");
         userToken = rs.getString("userToken");

         // 비밀번호 비교
         if (BCrypt.checkpw(userPassword, storedHashedPassword)) {
            session.setAttribute("userID", userID);
            session.setAttribute("userToken", userToken);
            response.sendRedirect("http://localhost:8080/todos/mainPage.jsp");
         } else {
            %>
            <script>
            alert("아이디 또는 비밀번호를 잘못 입력하셨습니다.");
            location.href = "http://localhost:8080/todos/auth/login.html";         
            </script>
            <%
         }
      } else {
         %>
         <script>
         alert("아이디 또는 비밀번호를 잘못 입력하셨습니다.");
         location.href = "http://localhost:8080/todos/auth/login.html";         
         </script>
         <%
      }
   } catch (Exception e) {
      e.printStackTrace();
   } finally {
      if (rs != null) {
         try {
            rs.close();
         } catch (SQLException e) {
            e.printStackTrace();
         }
      }
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
