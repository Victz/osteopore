package com.osteopore.repository;

import com.osteopore.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String>, AbstractRepository<User> {

    /**
     * Find User by username
     *
     * @param username
     * @return Optional User
     */
    @Query("SELECT user FROM User user WHERE user.username = :username and user.deleted = false")
    Optional<User> findByUsername(String username);

    /**
     * Find User by email
     *
     * @param email
     * @return Optional User
     */
    @Query("SELECT user FROM User user WHERE user.email = :email and user.deleted = false")
    Optional<User> findByEmail(String email);

    /**
     * Find User by phone
     *
     * @param phone
     * @return Optional User
     */
    @Query("SELECT user FROM User user WHERE user.phone = :phone and user.deleted = false")
    Optional<User> findByPhone(String phone);

    /**
     * Find User by activationKey
     *
     * @param activationKey
     * @return Optional User
     */
    Optional<User> findByActivationKey(String activationKey);

}
