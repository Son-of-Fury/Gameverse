package com.dev.finalproject.auth.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AuthUserResolverTest {

    private final AuthUserResolver resolver = new AuthUserResolver();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void supportsAnnotatedLongParameter() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("endpoint", Long.class, String.class);

        assertTrue(resolver.supportsParameter(new MethodParameter(method, 0)));
        assertFalse(resolver.supportsParameter(new MethodParameter(method, 1)));
    }

    @Test
    void resolveArgumentReturnsAuthenticatedUserId() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("endpoint", Long.class, String.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthPrincipal(15L, "user@example.com", "USER"), null, List.of())
        );

        Object result = resolver.resolveArgument(parameter, null, null, null);

        assertEquals(15L, result);
    }

    @Test
    void resolveArgumentRejectsMissingUserId() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("endpoint", Long.class, String.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new AuthPrincipal(null, "admin@example.com", "ADMIN"), null, List.of())
        );

        RuntimeException exception = assertThrows(RuntimeException.class, () -> resolver.resolveArgument(parameter, null, null, null));
        assertEquals("Unauthorized", exception.getMessage());
    }

    private static class DummyController {
        @SuppressWarnings("unused")
        void endpoint(@AuthUser Long userId, String other) {
        }
    }
}
