package com.collabsphere.collabsphere.config;

import com.collabsphere.collabsphere.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        HttpServletRequest servletRequest =
                ((ServletServerHttpRequest) request).getServletRequest();

        String token = servletRequest.getParameter("token");

        if (token == null || token.isBlank()) {
            return false;
        }

        try {

            String email = jwtService.extractUsername(token);

            attributes.put("email", email);

            return true;

        } catch (Exception e) {

            return false;

        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {

    }
}