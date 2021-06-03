package com.osteopore.repository;

import com.osteopore.domain.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for the Cases entity.
 */
@Repository
public interface CaseRepository extends JpaRepository<Case, String> {
}
