package com.osteopore.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import javax.persistence.*;
import java.util.List;
import java.util.Map;

@Repository
public class AbstractRepositoryImpl<T> implements AbstractRepository<T> {

    private final Logger log = LoggerFactory.getLogger(AbstractRepositoryImpl.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void refresh() {
        entityManager.setProperty("javax.persistence.cache.retrieveMode", CacheRetrieveMode.BYPASS);
        entityManager.setProperty("javax.persistence.storeMode", CacheStoreMode.REFRESH);
    }

    @Override
    public List findAll(String jpql) {
        return findAll(jpql, null, null, null);
    }

    @Override
    public List findAll(String jpql, Object[] params) {
        return findAll(jpql, params, null, null);
    }

    @Override
    public List findAll(String jpql, int[] range) {
        return findAll(jpql, null, range, null);
    }

    @Override
    public List findAll(String jpql, Map<String, String> sort) {
        return findAll(jpql, null, null, sort);
    }

    @Override
    public List findAll(String jpql, Object[] params, int[] range) {
        return findAll(jpql, params, range, null);
    }

    @Override
    public List findAll(String jpql, int[] range, Map<String, String> sort) {
        return findAll(jpql, null, range, sort);
    }

    @Override
    public List findAll(String jpql, Object[] params, Map<String, String> sort) {
        return findAll(jpql, params, null, sort);
    }

    @Override
    public List findAll(String jpql, Object[] params, int[] range, Map<String, String> sort) {
        Query query = entityManager.createQuery(jpql + buildSort(sort));
        if (params != null) for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
        if (range != null && range.length == 2) {
            query.setFirstResult(range[0]).setMaxResults(range[1]);
        }
        return query.getResultList();
    }

    @Override
    public long count(String jpql, Object[] params) {
        Query query = entityManager.createQuery(jpql);
        if (params != null) for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
        return (Long) query.getSingleResult();
    }

    private String buildSort(Map<String, String> sort) {
        StringBuilder jpql = new StringBuilder("");
        if (sort != null && sort.size() > 0) {
            jpql.append(" order by ");
            sort.keySet().forEach((key) -> {
                jpql.append(key).append(" ").append(sort.get(key)).append(",");
            });
            jpql.deleteCharAt(jpql.length() - 1);
        }
        return jpql.toString();
    }
}
