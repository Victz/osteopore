package com.osteopore.repository;

import com.osteopore.domain.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link Role} entity.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    /**
     * Find by name
     *
     * @param name
     * @return Optional User
     */
    Optional<Role> findOneByName(String name);
}
