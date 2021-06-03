package com.osteopore.service;

import com.osteopore.config.ApplicationConfig;
import com.osteopore.domain.AbstractEntity;
import com.osteopore.domain.User;
import com.osteopore.exception.BadRequestException;
import com.osteopore.model.PageModel;
import com.osteopore.model.UserModel;
import com.osteopore.repository.UserRepository;
import com.osteopore.security.DomainUserDetails;
import com.osteopore.security.TokenProvider;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
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
                entity.setDeleted(false);
                entity.setName(user.getName());
                entity.setPassword(encryptedPassword);
                entity.setLocale(LocaleContextHolder.getLocale().getLanguage());
                userRepository.save(entity);
                log.debug("Revert deleted User: {}", entity);
                return entity;
            } else if (!entity.isActivated()) {
                entity.setName(user.getName());
                entity.setPassword(encryptedPassword);
                entity.setLocale(LocaleContextHolder.getLocale().getLanguage());
                userRepository.save(entity);
                log.debug("Re-initialize existing non-activated User: {}", entity);
                return entity;
            } else {
                throw new BadRequestException(messageSource.getMessage("user.email.alreadyexist", null, LocaleContextHolder.getLocale()));
            }
        }

        entity = new User();
        entity.setId(UUID.randomUUID().toString());
        entity.setName(user.getName());
        entity.setUsername(entity.getId());
        entity.setEmail(user.getEmail().toLowerCase());
        entity.setLocale(LocaleContextHolder.getLocale().getLanguage());
        entity.setActivationKey(UUID.randomUUID().toString());
        userRepository.save(entity);
        log.debug("Created User: {}", entity);
        return entity;
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

    public UserModel login(UserModel userModel) {

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userModel.getLogin(), userModel.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.createToken(authentication, false);

//        HttpHeaders httpHeaders = new HttpHeaders();
//        httpHeaders.add(HttpHeaders.AUTHORIZATION, "Bearer " + jwt);

        DomainUserDetails userDetails = (DomainUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        userModel.setName(userDetails.getName());
        userModel.setLogin(userDetails.getUsername());
        userModel.setLocale(userDetails.getLocale());
        userModel.setAccessToken(jwt);
        userModel.setRoles(roles);
        return userModel;
    }

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
                        }
                    }
                    for (Field field : AbstractEntity.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("user." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                        }
                    }
                } else {
                    for (Field field : User.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(key)) {
                            params.add("%" + value.replace(" ", "%") + "%");
                            jpql.append(" and user.").append(field.getName()).append(" like ?").append(params.size());
                        }
                    }
                }
            }
        }

        if (pageModel.getNumber() == 0) pageModel.setNumber(1);
        if (pageModel.getSize() == 0) pageModel.setSize(applicationConfig.getPageSize());
        if (pageModel.getSort().isEmpty()) pageModel.getSort().put("user.lastModifiedDate", "desc");

        pageModel.setTotalElements(userRepository.count("select count(user)" + jpql, params.toArray()));
        pageModel.setTotalPages((int) (pageModel.getTotalElements() + pageModel.getSize() - 1) / pageModel.getSize());
        if (pageModel.getTotalPages() != 0 && pageModel.getNumber() > pageModel.getTotalPages()) {
            pageModel.setNumber(pageModel.getTotalPages());
        }
        if (pageModel.getNumber() == 1) pageModel.setFirst(true);
        if (pageModel.getNumber() == pageModel.getTotalPages()) pageModel.setLast(true);
        int[] range = {(pageModel.getNumber() - 1) * pageModel.getSize(), pageModel.getSize()};
        List<User> users = userRepository.findAll("select user" + jpql.toString(), params.toArray(), range, pageModel.getSort());
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
//
//    public User createUser(UserDTO userDTO) {
//        User user = new User();
//        user.setLogin(userDTO.getLogin().toLowerCase());
//        user.setFirstName(userDTO.getFirstName());
//        user.setLastName(userDTO.getLastName());
//        if (userDTO.getEmail() != null) {
//            user.setEmail(userDTO.getEmail().toLowerCase());
//        }
//        user.setImageUrl(userDTO.getImageUrl());
//        if (userDTO.getLangKey() == null) {
//            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
//        } else {
//            user.setLangKey(userDTO.getLangKey());
//        }
//        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
//        user.setPassword(encryptedPassword);
//        user.setResetKey(RandomUtil.generateResetKey());
//        user.setResetDate(Instant.now());
//        user.setActivated(true);
//        if (userDTO.getAuthorities() != null) {
//            Set<Authority> authorities = userDTO.getAuthorities().stream()
//                    .map(authorityRepository::findById)
//                    .filter(Optional::isPresent)
//                    .map(Optional::get)
//                    .collect(Collectors.toSet());
//            user.setAuthorities(authorities);
//        }
//        userRepository.save(user);
//        log.debug("Created Information for User: {}", user);
//        return user;
//    }
//
//    /**
//     * Update all information for a specific user, and return the modified user.
//     *
//     * @param userDTO user to update.
//     * @return updated user.
//     */
//    public Optional<UserDTO> updateUser(UserDTO userDTO) {
//        return Optional.of(userRepository
//                .findById(userDTO.getId()))
//                .filter(Optional::isPresent)
//                .map(Optional::get)
//                .map(user -> {
//                    user.setLogin(userDTO.getLogin().toLowerCase());
//                    user.setFirstName(userDTO.getFirstName());
//                    user.setLastName(userDTO.getLastName());
//                    if (userDTO.getEmail() != null) {
//                        user.setEmail(userDTO.getEmail().toLowerCase());
//                    }
//                    user.setImageUrl(userDTO.getImageUrl());
//                    user.setActivated(userDTO.isActivated());
//                    user.setLangKey(userDTO.getLangKey());
//                    Set<Authority> managedAuthorities = user.getAuthorities();
//                    managedAuthorities.clear();
//                    userDTO.getAuthorities().stream()
//                            .map(authorityRepository::findById)
//                            .filter(Optional::isPresent)
//                            .map(Optional::get)
//                            .forEach(managedAuthorities::add);
//                    log.debug("Changed Information for User: {}", user);
//                    return user;
//                })
//                .map(UserDTO::new);
//    }
//
//    public void deleteUser(String login) {
//        userRepository.findOneByLogin(login).ifPresent(user -> {
//            userRepository.delete(user);
//            log.debug("Deleted User: {}", user);
//        });
//    }
//
//    /**
//     * Update basic information (first name, last name, email, language) for the current user.
//     *
//     * @param firstName first name of user.
//     * @param lastName last name of user.
//     * @param email email id of user.
//     * @param langKey language key.
//     * @param imageUrl image URL of user.
//     */
//    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
//        SecurityUtils.getCurrentUserLogin()
//                .flatMap(userRepository::findOneByLogin)
//                .ifPresent(user -> {
//                    user.setFirstName(firstName);
//                    user.setLastName(lastName);
//                    if (email != null) {
//                        user.setEmail(email.toLowerCase());
//                    }
//                    user.setLangKey(langKey);
//                    user.setImageUrl(imageUrl);
//                    log.debug("Changed Information for User: {}", user);
//                });
//    }
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
//
//    @Transactional(readOnly = true)
//    public Page<UserDTO> getAllManagedUsers(Pageable pageable) {
//        return userRepository.findAllByLoginNot(pageable, Constants.ANONYMOUS_USER).map(UserDTO::new);
//    }
//
//    @Transactional(readOnly = true)
//    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
//        return userRepository.findOneWithAuthoritiesByLogin(login);
//    }
//
//    @Transactional(readOnly = true)
//    public Optional<User> getUserWithAuthorities() {
//        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
//    }
//
//    /**
//     * Not activated users should be automatically deleted after 3 days.
//     * <p>
//     * This is scheduled to get fired everyday, at 01:00 (am).
//     */
//    @Scheduled(cron = "0 0 1 * * ?")
//    public void removeNotActivatedUsers() {
//        userRepository
//                .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
//                .forEach(user -> {
//                    log.debug("Deleting not activated user {}", user.getLogin());
//                    userRepository.delete(user);
//                });
//    }
}
