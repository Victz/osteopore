package com.osteopore.repository;

import java.util.List;
import java.util.Map;

public interface AbstractRepository<T> {

    void refresh();

    List<T> findAll(String jpql);

    List<T> findAll(String jpql, Object[] params);

    List<T> findAll(String jpql, int[] range);

    List<T> findAll(String jpql, Map<String, String> sort);

    List<T> findAll(String jpql, Object[] params, int[] range);

    List<T> findAll(String jpql, Object[] params, Map<String, String> sort);

    List<T> findAll(String jpql, int[] range, Map<String, String> sort);

    List<T> findAll(String jpql, Object[] params, int[] range, Map<String, String> sort);

    long count(String jpql, Object[] params);

}
