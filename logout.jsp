<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="javax.servlet.http.HttpSession" %>

<%   String userID = (String)session.getAttribute("userID");
    if (userID != null) {
        session.invalidate(); // 세션 무효화
    }
    response.sendRedirect("http://localhost:8080/todos/auth/login.html"); // 로그인 페이지로 리다이렉트
%>