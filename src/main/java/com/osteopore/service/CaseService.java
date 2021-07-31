package com.osteopore.service;

import com.osteopore.config.ApplicationConfig;
import com.osteopore.domain.AbstractEntity;
import com.osteopore.domain.Case;
import com.osteopore.exception.BadRequestException;
import com.osteopore.model.PageModel;
import com.osteopore.repository.CaseRepository;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service class for managing stories.
 */
@Service
@Transactional
public class CaseService {

    private final Logger log = LoggerFactory.getLogger(CaseService.class);

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private CaseRepository caseRepository;
    @Autowired
    private ApplicationConfig applicationConfig;

    @Transactional(readOnly = true)
    public PageModel<Case> list(String path) {

        PageModel<Case> pageModel = new PageModel<>();

        StringBuilder jpql = new StringBuilder().append(" from Case entity where entity.deleted = false");
        List<Object> params = new ArrayList<>();

        if (path.startsWith("/")) {
            path = path.substring(1);
        }

        if (!StringUtils.isBlank(path)) {
            String[] pathArray = path.split("/");
            if (pathArray.length % 2 != 0) {
                throw new BadRequestException(messageSource
                        .getMessage("error.query.path.validate", null, LocaleContextHolder.getLocale()));
            }

            for (int i = 0; i < pathArray.length / 2; i++) {

                String key = pathArray[2 * i];
                String value = pathArray[2 * i + 1];

                if (key.equalsIgnoreCase("page")) {
                    if (StringUtils.isNumeric(value)) {
                        int pageNumber = Integer.parseInt(value);
                        if (pageNumber > 0) pageModel.setNumber(pageNumber);
                    }
                } else if (key.equalsIgnoreCase("size")) {
                    if (StringUtils.isNumeric(value)) {
                        int size = Integer.parseInt(value);
                        if (size > 0) pageModel.setSize(size);
                    }
                } else if (key.equalsIgnoreCase("sort")) {
                    String[] sortArray = value.split(",");
                    for (Field field : Case.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("entity." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                    for (Field field : AbstractEntity.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("entity." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                } else {
                    for (Field field : Case.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(key)) {
                            if (field.getType().equals(String.class)) {
                                params.add("%" + value.replace(" ", "%") + "%");
                                jpql.append(" and entity.").append(field.getName()).append(" like ?").append(params.size());
                            } else if (field.getType().equals(Boolean.class)) {
                                params.add(Boolean.valueOf(value));
                                jpql.append(" and entity.").append(field.getName()).append(" = ?").append(params.size());
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (pageModel.getNumber() == 0) pageModel.setNumber(1);
        if (pageModel.getSize() == 0) pageModel.setSize(applicationConfig.getPage().getSize());
        if (pageModel.getSort().isEmpty()) pageModel.getSort().put("entity.lastModifiedDate", "desc");

        pageModel.setTotalElements(caseRepository.count("select count(entity)" + jpql, params.toArray()));
        pageModel.setTotalPages((int) (pageModel.getTotalElements() + pageModel.getSize() - 1) / pageModel.getSize());
        if (pageModel.getTotalPages() != 0 && pageModel.getNumber() > pageModel.getTotalPages()) {
            pageModel.setNumber(pageModel.getTotalPages());
        }
        if (pageModel.getNumber() == 1) pageModel.setFirst(true);
        if (pageModel.getNumber() == pageModel.getTotalPages()) pageModel.setLast(true);
        int[] range = {(pageModel.getNumber() - 1) * pageModel.getSize(), pageModel.getSize()};
        List<Case> models = caseRepository.findAll("select entity" + jpql, params.toArray(), range, pageModel.getSort());
        pageModel.setContent(models == null ? new ArrayList<>() : models);
        return pageModel;
    }

    public Case create(Case model) {
        if (StringUtils.isNotBlank(model.getId())) {
            throw new BadRequestException(messageSource.getMessage("error.create", null, LocaleContextHolder.getLocale()));
        }
        model.setId(UUID.randomUUID().toString());
        return caseRepository.save(model);
    }

    public Case update(Case model) {
        if (StringUtils.isBlank(model.getId())) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        Case entity = caseRepository.findById(model.getId()).orElse(null);
        if (entity == null) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }
        if (StringUtils.isNotBlank(model.getName())) {
            entity.setName(model.getName());
        }
        entity.setNumber(model.getNumber());
        entity.setDescription(model.getDescription());
        entity.setRemark(model.getRemark());
        return caseRepository.save(entity);
    }

    /**
     * Not activated records should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivated() {
//        userRepository
//                .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
//                .forEach(user -> {
//                    log.debug("Deleting not activated user {}", user.getLogin());
//                    userRepository.delete(user);
//                });
    }
}
