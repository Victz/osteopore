package com.osteopore.service;

import com.osteopore.config.ApplicationConfig;
import com.osteopore.domain.AbstractEntity;
import com.osteopore.domain.Role;
import com.osteopore.domain.User;
import com.osteopore.exception.BadRequestException;
import com.osteopore.model.LoginModel;
import com.osteopore.model.PageModel;
import com.osteopore.model.UserModel;
import com.osteopore.repository.RoleRepository;
import com.osteopore.repository.UserRepository;
import com.osteopore.security.DomainUserDetails;
import com.osteopore.security.TokenProvider;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TokenProvider tokenProvider;
    @Autowired
    private AuthenticationManagerBuilder authenticationManagerBuilder;
    @Autowired
    private ApplicationConfig applicationConfig;

    public User register(User user) {

        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        User entity = userRepository.findByEmail(user.getEmail().toLowerCase()).orElse(null);

        if (entity != null) {
            if (entity.isDeleted()) {
                log.debug("Revert deleted User: {}", entity);
                entity.setDeleted(false);
                entity.setRoles(new HashSet<>());
            } else {
                throw new BadRequestException(messageSource.getMessage("user.email.alreadyexist", null, LocaleContextHolder.getLocale()));
            }
        } else {
            entity = new User();
            entity.setId(UUID.randomUUID().toString());
        }

        entity.setName(user.getName());
        entity.setUsername(entity.getId());
        entity.setEmail(user.getEmail().toLowerCase());
        entity.setPassword(encryptedPassword);
        entity.setLocale(LocaleContextHolder.getLocale().getLanguage());
        entity.setActivationKey(UUID.randomUUID().toString());
        return userRepository.save(entity);
    }

    public void activate(String key) {
        log.debug("Activating user for activation key {}", key);
        userRepository.findByActivationKey(key)
                .map(user -> {
                    user.setActivated(true);
                    user.setActivationKey(null);
                    log.debug("Activated user: {}", user);
                    return user;
                }).orElseThrow(() -> new BadRequestException(messageSource
                .getMessage("user.activate.validate", null, LocaleContextHolder.getLocale())));
    }

    public LoginModel login(LoginModel loginModel) {

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginModel.getLogin(), loginModel.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.createToken(authentication, false);

//        HttpHeaders httpHeaders = new HttpHeaders();
//        httpHeaders.add(HttpHeaders.AUTHORIZATION, "Bearer " + jwt);

        DomainUserDetails userDetails = (DomainUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        loginModel.setName(userDetails.getName());
        loginModel.setLogin(userDetails.getUsername());
        loginModel.setLocale(userDetails.getLocale());
        loginModel.setAccessToken(jwt);
        loginModel.setRoles(roles);
        return loginModel;
    }

    @Transactional(readOnly = true)
    public PageModel<User> list(String path) {

        PageModel<User> pageModel = new PageModel<>();

        StringBuilder jpql = new StringBuilder().append(" from User user where user.deleted = false");
        List<Object> params = new ArrayList<>();

        if (path.startsWith("/")) {
            path = path.substring(1);
        }

        if (!StringUtils.isBlank(path)) {
            String[] pathArray = path.split("/");
            if (pathArray.length % 2 != 0) {
                throw new BadRequestException(messageSource
                        .getMessage("error.query.path.validate", null, LocaleContextHolder.getLocale()));
            }

            for (int i = 0; i < pathArray.length / 2; i++) {

                String key = pathArray[2 * i];
                String value = pathArray[2 * i + 1];

                if (key.equalsIgnoreCase("page")) {
                    if (StringUtils.isNumeric(value)) {
                        int pageNumber = Integer.parseInt(value);
                        if (pageNumber > 0) pageModel.setNumber(pageNumber);
                    }
                } else if (key.equalsIgnoreCase("size")) {
                    if (StringUtils.isNumeric(value)) {
                        int size = Integer.parseInt(value);
                        if (size > 0) pageModel.setSize(size);
                    }
                } else if (key.equalsIgnoreCase("sort")) {
                    String[] sortArray = value.split(",");
                    for (Field field : User.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("user." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                    for (Field field : AbstractEntity.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("user." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                } else {
                    for (Field field : User.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(key)) {
                            if (field.getType().equals(String.class)) {
                                params.add("%" + value.replace(" ", "%") + "%");
                                jpql.append(" and user.").append(field.getName()).append(" like ?").append(params.size());
                            } else if (field.getType().equals(Boolean.class)) {
                                params.add(Boolean.valueOf(value));
                                jpql.append(" and user.").append(field.getName()).append(" = ?").append(params.size());
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (pageModel.getNumber() == 0) pageModel.setNumber(1);
        if (pageModel.getSize() == 0) pageModel.setSize(applicationConfig.getPage().getSize());
        if (pageModel.getSort().isEmpty()) pageModel.getSort().put("user.lastModifiedDate", "desc");

        pageModel.setTotalElements(userRepository.count("select count(user)" + jpql, params.toArray()));
        pageModel.setTotalPages((int) (pageModel.getTotalElements() + pageModel.getSize() - 1) / pageModel.getSize());
        if (pageModel.getTotalPages() != 0 && pageModel.getNumber() > pageModel.getTotalPages()) {
            pageModel.setNumber(pageModel.getTotalPages());
        }
        if (pageModel.getNumber() == 1) pageModel.setFirst(true);
        if (pageModel.getNumber() == pageModel.getTotalPages()) pageModel.setLast(true);
        int[] range = {(pageModel.getNumber() - 1) * pageModel.getSize(), pageModel.getSize()};
        List<User> users = userRepository.findAll("select user" + jpql, params.toArray(), range, pageModel.getSort());
        pageModel.setContent(users == null ? new ArrayList<>() : users);
        return pageModel;


//        User model = new User();
//        Sort sort = Sort.unsorted();
//        Pageable pageable = PageRequest.of(0, 20);
//
//        if (path.startsWith("/")) {
//            path = path.substring(1);
//        }
//
//        if (!StringUtils.isBlank(path)) {
//            String[] pathArray = path.split("/");
//            if (pathArray.length % 2 != 0) {
//                throw new BadRequestException(messageSource
//                        .getMessage("error.query.path.validate", null, LocaleContextHolder.getLocale()));
//            }
//
//            for (int i = 0; i < pathArray.length / 2; i++) {
//
//                String key = pathArray[2 * i];
//                String value = pathArray[2 * i + 1];
//
//                if (key.equalsIgnoreCase("sort")) {
//
//                    String[] sortArray = value.split(",");
//                    sort = sort.and(Sort.by(sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc")
//                            ? Sort.Direction.DESC : Sort.Direction.ASC, sortArray[0]));
//
//                } else if (key.equalsIgnoreCase("page")) {
//
//                    if (StringUtils.isNumeric(value)) {
//                        int pageNo = Integer.parseInt(value);
//                        if (pageNo > 1) {
//                            pageable = PageRequest.of(pageNo - 1, pageable.getPageSize());
//                        }
//                    }
//                } else if (key.equalsIgnoreCase("size")) {
//
//                    if (StringUtils.isNumeric(value)) {
//                        int size = Integer.parseInt(value);
//                        if (size > 0) {
//                            pageable = PageRequest.of(pageable.getPageNumber(), size);
//                        }
//                    }
//                } else {
//                    for (Field field : User.class.getDeclaredFields()) {
//
//                        if (field.getName().equalsIgnoreCase(key)) {
//                            boolean accessible = field.canAccess(model);
//                            if (!accessible) {
//                                field.setAccessible(true);
//                            }
//                            try {
//                                field.set(model, value);
//                            } catch (IllegalAccessException e) {
//                                e.printStackTrace();
//                            }
//                            field.setAccessible(accessible);
//                        }
//                    }
//                }
//            }
//        }
//
//        if (sort.isUnsorted()) {
//            sort = Sort.by(Sort.Order.desc("lastModifiedDate"));
//        }
//
//        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
//
//        ExampleMatcher matcher = ExampleMatcher.matching().withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING).withIgnoreCase()
//                .withNullHandler(ExampleMatcher.NullHandler.IGNORE).withIgnoreNullValues()
//                .withIgnorePaths("activated").withIgnorePaths("createdDate").withIgnorePaths("lastModifiedDate");
//
//        return userRepository.findAll(Example.of(model, matcher), pageable);
    }

//    public Optional<User> completePasswordReset(String newPassword, String key) {
//        log.debug("Reset user password for reset key {}", key);
//        return userRepository.findOneByResetKey(key)
//                .filter(user -> user.getResetDate().isAfter(Instant.now().minusSeconds(86400)))
//                .map(user -> {
//                    user.setPassword(passwordEncoder.encode(newPassword));
//                    user.setResetKey(null);
//                    user.setResetDate(null);
//                    return user;
//                });
//    }
//    public Optional<User> requestPasswordReset(String mail) {
//        return userRepository.findOneByEmailIgnoreCase(mail)
//                .filter(User::getActivated)
//                .map(user -> {
//                    user.setResetKey(RandomUtil.generateResetKey());
//                    user.setResetDate(Instant.now());
//                    return user;
//                });
//    }

    public User create(UserModel userModel) {

        if (StringUtils.isNotBlank(userModel.getId())) {
            throw new BadRequestException(messageSource.getMessage("error.create", null, LocaleContextHolder.getLocale()));
        }

        User entity = userRepository.findByEmail(userModel.getEmail().toLowerCase()).orElse(null);
        if (entity != null) {
            throw new BadRequestException(messageSource.getMessage("user.email.alreadyexist", null, LocaleContextHolder.getLocale()));
        }

        entity = new User();
        entity.setId(UUID.randomUUID().toString());
        entity.setName(userModel.getName());
        entity.setUsername(userModel.getUsername().toLowerCase());
        entity.setEmail(userModel.getEmail().toLowerCase());
        entity.setActivated(userModel.getActivated());

        if (userModel.getRoles() != null && !userModel.getRoles().isEmpty()) {
            List roles = new ArrayList();
            userModel.getRoles().forEach(selectedRole -> {
                if (StringUtils.isNotBlank(selectedRole.getId())) {
                    Optional<Role> role = roleRepository.findById(selectedRole.getId());
                    if (role.isPresent()) roles.add(role.get());
                }
            });
            entity.setRoles(new HashSet<>(roles));
        }

        return userRepository.save(entity);
    }

    public User update(UserModel userModel) {
        if (StringUtils.isBlank(userModel.getId())) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        User entity = userRepository.findById(userModel.getId()).orElse(null);
        if (entity == null) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        entity.setName(userModel.getName());
        entity.setUsername(userModel.getUsername().toLowerCase());
        entity.setEmail(userModel.getEmail().toLowerCase());
        entity.setActivated(userModel.getActivated());

        if (userModel.getRoles() != null && !userModel.getRoles().isEmpty()) {
            List roles = new ArrayList();
            userModel.getRoles().forEach(selectedRole -> {
                if (StringUtils.isNotBlank(selectedRole.getId())) {
                    Optional<Role> role = roleRepository.findById(selectedRole.getId());
                    if (role.isPresent()) roles.add(role.get());
                }
            });
            entity.setRoles(new HashSet<>(roles));
        } else {
            entity.setRoles(new HashSet<>());
        }

        return userRepository.save(entity);
    }
//
//    @Transactional
//    public void changePassword(String currentClearTextPassword, String newPassword) {
//        SecurityUtils.getCurrentUserLogin()
//                .flatMap(userRepository::findOneByLogin)
//                .ifPresent(user -> {
//                    String currentEncryptedPassword = user.getPassword();
//                    if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
//                        throw new InvalidPasswordException();
//                    }
//                    String encryptedPassword = passwordEncoder.encode(newPassword);
//                    user.setPassword(encryptedPassword);
//                    log.debug("Changed password for User: {}", user);
//                });
//    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
//        userRepository
//                .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
//                .forEach(user -> {
//                    log.debug("Deleting not activated user {}", user.getLogin());
//                    userRepository.delete(user);
//                });
    }
}
