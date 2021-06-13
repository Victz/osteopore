package com.osteopore.controller;

import com.osteopore.domain.Role;
import com.osteopore.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RoleController {

    private final Logger log = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping("/admin/roles")
    public List<Role> list() {
        log.debug("REST request to get all Roles.");
        return roleRepository.findAll();
    }

    @GetMapping("/admin/role/{id}")
    public ResponseEntity<Role> details(@PathVariable String id) {
        log.debug("REST request to get Role : {}", id);
        Optional<Role> role = roleRepository.findById(id);
        return role.map(entity -> ResponseEntity.ok().body(entity))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
