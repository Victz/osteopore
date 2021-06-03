package com.osteopore.repository;

import com.osteopore.domain.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for the Inventory entity.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
}
