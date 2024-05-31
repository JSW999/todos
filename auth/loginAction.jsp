<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type"   content="text/html; charset=UTF-8">
<title>Login Action</title>
</head>
<body>
   <%
   String userID = request.getParameter("userID");
   String password = request.getParameter("userPassword");
   String userToken = null;
   
   String dbURL = "jdbc:mysql://localhost:3306/user?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
   String dbUser = "root";
   String dbPassword = "1234";
   
   Connection conn = null;
   PreparedStatement pstmt = null;
   ResultSet rs = null;
   
   try {
      Class.forName("com.mysql.cj.jdbc.Driver");
      conn = DriverManager.getConnection(dbURL, dbUser, dbPassword);
      
      String sql = "SELECT * FROM user WHERE userID=? AND userPassword=?";
      pstmt = conn.prepareStatement(sql);
      pstmt.setString(1, userID);
      pstmt.setString(2, password);

      rs = pstmt.executeQuery();
      
      if (rs.next()) {
    	  	userToken = rs.getString("userToken");
            session.setAttribute("userID", userID);
            session.setAttribute("userToken", userToken);
         	response.sendRedirect("https://jsw999.github.io/todos/auth/loginAction.jsp");
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
