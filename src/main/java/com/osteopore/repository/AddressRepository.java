package com.osteopore.repository;

import com.osteopore.domain.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for the Address entity.
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, String> {
}
