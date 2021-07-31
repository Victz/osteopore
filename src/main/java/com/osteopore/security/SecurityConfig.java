package com.osteopore.security;

import com.osteopore.config.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import javax.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private TokenFilter tokenFilter;

    @Autowired
    private MessageSource messageSource;

    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
                .antMatchers(HttpMethod.OPTIONS, "/**")
                .antMatchers("/**/*.{js,html,css,png,svg,eot,ttf,woff,appcache,jpg,jpeg,gif,ico,csv}")
                .antMatchers("/public/**")
                .antMatchers("/static/**")
                .antMatchers("/content/**")
                .antMatchers("/locales/**")
                .antMatchers("/h2-console/**")
                .antMatchers("/swagger-ui/index.html")
                .antMatchers("/v3/api-docs/**");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        // Enable CORS and disable CSRF
        http = http.cors().and().csrf().disable();

        // Set session management to stateless
        http = http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and();


        // Add JWT token filter and authorize request.
        http.addFilterBefore(tokenFilter, UsernamePasswordAuthenticationFilter.class);
        http.authorizeRequests()
                .antMatchers("/api/home/**").authenticated()
                .antMatchers("/api/admin/**").hasAuthority(Constants.ROLE_ADMIN)
                .anyRequest().permitAll();

        // Set unauthorized requests exception handler
        http = http.exceptionHandling().authenticationEntryPoint(
                (request, response, ex) -> {
                    if (ex instanceof BadCredentialsException)
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                                messageSource.getMessage("error.authentication.badCredentials", null, LocaleContextHolder.getLocale()));
                    else if (ex instanceof InsufficientAuthenticationException)
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                                messageSource.getMessage("error.authentication.noAuthority", null, LocaleContextHolder.getLocale()));
                    else
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getLocalizedMessage());
                }
        ).and();
    }

    // Used by spring security if CORS is enabled.
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
