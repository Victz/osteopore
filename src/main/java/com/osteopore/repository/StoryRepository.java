package com.osteopore.repository;

import com.osteopore.domain.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for the Story entity.
 */
@Repository
public interface StoryRepository extends JpaRepository<Story, String> {
}
