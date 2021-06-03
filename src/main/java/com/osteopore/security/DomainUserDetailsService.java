package com.osteopore.security;

import com.osteopore.domain.User;
import com.osteopore.repository.UserRepository;
import com.osteopore.service.MailService;
import com.osteopore.service.PhoneService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class DomainUserDetailsService implements UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(DomainUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private PhoneService phoneService;

    @Autowired
    private MessageSource messageSource;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {
        log.debug("Authenticating {}", login);

        String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);

        User user;
        if (mailService.validate(lowercaseLogin)) {
            user = userRepository.findByEmail(lowercaseLogin).orElseThrow(() -> new UsernameNotFoundException(
                    messageSource.getMessage("error.authentication.userNotFound", new String[]{login}, LocaleContextHolder.getLocale())));
        } else if (phoneService.validate(lowercaseLogin)) {
            user = userRepository.findByPhone(lowercaseLogin).orElseThrow(() -> new UsernameNotFoundException(
                    messageSource.getMessage("error.authentication.userNotFound", new String[]{login}, LocaleContextHolder.getLocale())));
        } else {
            user = userRepository.findByUsername(lowercaseLogin).orElseThrow(() -> new UsernameNotFoundException(
                    messageSource.getMessage("error.authentication.userNotFound", new String[]{login}, LocaleContextHolder.getLocale())));
        }

        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                .collect(Collectors.toList());

        return new DomainUserDetails(user.getId(), user.getName(), user.getUsername(), user.getEmail(), user.getPhone(), user.getPassword(), user.getLocale(), authorities);

    }
}
