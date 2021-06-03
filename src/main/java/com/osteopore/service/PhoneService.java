package com.osteopore.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for sending sms.
 * <p>
 * We use the {@link Async} annotation to send sms asynchronously.
 */
@Service
public class PhoneService {

    private final Logger log = LoggerFactory.getLogger(PhoneService.class);

    private static final Pattern PATTERN = Pattern.compile("^\\+[0-9]+$");
    private static Matcher matcher;


    /**
     * Validate phone number with regular expression
     *
     * @param phone number
     * @return true valid email, false invalid email
     */
    public boolean validate(final String phone) {
        matcher = PATTERN.matcher(phone);
        return matcher.matches();
    }

}
