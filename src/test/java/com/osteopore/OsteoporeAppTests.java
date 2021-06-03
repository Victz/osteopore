package com.osteopore;

import com.osteopore.domain.Role;
import com.osteopore.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class OsteoporeAppTests {

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void contextLoads() {
//        Role entity = new Role();
//        entity.setId(UUID.randomUUID().toString());
//        entity.setName("ROLE_ADMIN");
//        entity.setCreatedBy("test");
//        entity.setLastModifiedBy("test");
//        roleRepository.save(entity);
//
//        Role role = roleRepository.findById(entity.getId()).get();
//        assertEquals(entity, role);
    }

}
