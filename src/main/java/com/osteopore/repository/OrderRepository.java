package com.osteopore.repository;

import com.osteopore.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for the OrderItem entity.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
}
