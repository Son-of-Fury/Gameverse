package com.dev.finalproject.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthFilterTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void filterSetsAuthenticationForValidBearerToken() throws Exception {
        JwtService jwtService = Mockito.mock(JwtService.class);
        JwtAuthFilter filter = new JwtAuthFilter(jwtService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = Mockito.mock(FilterChain.class);

        Claims claims = Mockito.mock(Claims.class);
        @SuppressWarnings("unchecked")
        Jws<Claims> jws = Mockito.mock(Jws.class);
        when(jws.getBody()).thenReturn(claims);
        when(claims.get("role", String.class)).thenReturn("USER");
        when(claims.get("email", String.class)).thenReturn("user@example.com");
        when(claims.get("userId", Number.class)).thenReturn(8L);
        when(jwtService.parse("valid-token")).thenReturn(jws);

        filter.doFilter(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertInstanceOf(AuthPrincipal.class, authentication.getPrincipal());
        AuthPrincipal principal = (AuthPrincipal) authentication.getPrincipal();
        assertEquals(8L, principal.getUserId());
        assertEquals("USER", principal.getRole());
        verify(chain).doFilter(request, response);
    }

    @Test
    void filterIgnoresInvalidTokenAndStillContinuesChain() throws Exception {
        JwtService jwtService = Mockito.mock(JwtService.class);
        JwtAuthFilter filter = new JwtAuthFilter(jwtService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer broken-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = Mockito.mock(FilterChain.class);
        doThrow(new RuntimeException("invalid")).when(jwtService).parse("broken-token");

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }
}
