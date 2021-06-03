package com.osteopore.repository;

import com.osteopore.domain.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for the Cases entity.
 */
@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, String> {
}
