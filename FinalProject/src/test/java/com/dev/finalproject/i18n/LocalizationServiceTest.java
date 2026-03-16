package com.dev.finalproject.i18n;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocalizationServiceTest {

    @Mock
    private MessageSource messageSource;

    @AfterEach
    void tearDown() {
        LocaleContextHolder.resetLocaleContext();
    }

    @Test
    void getUsesCurrentThreadLocale() {
        LocaleContextHolder.setLocale(Locale.ENGLISH);
        when(messageSource.getMessage("auth.invalidCredentials", new Object[]{"x"}, Locale.ENGLISH)).thenReturn("Invalid credentials");
        LocalizationService service = new LocalizationService(messageSource);

        String result = service.get("auth.invalidCredentials", "x");

        assertEquals("Invalid credentials", result);
        verify(messageSource).getMessage("auth.invalidCredentials", new Object[]{"x"}, Locale.ENGLISH);
    }
}
