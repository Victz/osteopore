package com.osteopore.controller;

import com.osteopore.domain.User;
import com.osteopore.model.PageModel;
import com.osteopore.repository.UserRepository;
import com.osteopore.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    private final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    /**
     * {@code GET  /admin/users} : get all users.
     */
    @GetMapping("/admin/users/**")
    public PageModel<User> list(HttpServletRequest request) {

        String path = request.getRequestURI().substring("/api/admin/users".length());
        log.debug("REST request to get all Users. Path: " + path);
        return userService.list(path);
    }

    /**
     * {@code DELETE  /admin/user/:id} : delete the "id" user.
     *
     * @param id the id of the user to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/admin/user/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.debug("REST request to delete User : {}", id);
//        userRepository.deleteById(id);
        User user = userRepository.findById(id).get();
        user.setDeleted(true);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    /**
     * {@code GET  /admin/user/:id} : get the "id" user.
     *
     * @param id the id of the user to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the user, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/admin/user/{id}")
    public ResponseEntity<User> details(@PathVariable String id) {
        log.debug("REST request to get User : {}", id);
        Optional<User> user = userRepository.findById(id);
        return user.map(entity -> ResponseEntity.ok().body(entity))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    /**
     * {@code POST  /admin/user} : Create a new user.
     *
     * @param user the user to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new user, or with status {@code 400 (Bad Request)} if the user has already an ID.
     */
    @PostMapping("/admin/user")
    public ResponseEntity<User> create(@RequestBody User user) {
        log.debug("REST request to create User : {}", user);
        User entity = userService.create(user);
        return ResponseEntity.ok().body(entity);
    }

    /**
     * {@code PUT  /admin/user} : Updates an existing user.
     *
     * @param user the user to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated user,
     * or with status {@code 400 (Bad Request)} if the user is not valid,
     * or with status {@code 500 (Internal Server Error)} if the user couldn't be updated.
     */
    @PutMapping("/admin/user")
    public ResponseEntity<User> update(@RequestBody User user) {
        log.debug("REST request to update User : {}", user);
        User entity = userService.update(user);
        return ResponseEntity.ok().body(entity);
    }

}
