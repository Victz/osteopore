package com.osteopore.service;

import com.osteopore.config.ApplicationConfig;
import com.osteopore.domain.AbstractEntity;
import com.osteopore.domain.Product;
import com.osteopore.exception.BadRequestException;
import com.osteopore.model.PageModel;
import com.osteopore.repository.ProductRepository;
import com.osteopore.utils.ImageUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service class for managing products.
 */
@Service
@Transactional
public class ProductService {

    private final Logger log = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ApplicationConfig applicationConfig;

    @Transactional(readOnly = true)
    public PageModel<Product> list(String path) {

        PageModel<Product> pageModel = new PageModel<>();

        StringBuilder jpql = new StringBuilder().append(" from Product product where product.deleted = false");
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
                    for (Field field : Product.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("product." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                    for (Field field : AbstractEntity.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("product." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                } else {
                    for (Field field : Product.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(key)) {
                            if (field.getType().equals(String.class)) {
                                params.add("%" + value.replace(" ", "%") + "%");
                                jpql.append(" and product.").append(field.getName()).append(" like ?").append(params.size());
                            } else if (field.getType().equals(Boolean.class)) {
                                params.add(Boolean.valueOf(value));
                                jpql.append(" and product.").append(field.getName()).append(" = ?").append(params.size());
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (pageModel.getNumber() == 0) pageModel.setNumber(1);
        if (pageModel.getSize() == 0) pageModel.setSize(applicationConfig.getPage().getSize());
        if (pageModel.getSort().isEmpty()) pageModel.getSort().put("product.lastModifiedDate", "desc");

        pageModel.setTotalElements(productRepository.count("select count(product)" + jpql, params.toArray()));
        pageModel.setTotalPages((int) (pageModel.getTotalElements() + pageModel.getSize() - 1) / pageModel.getSize());
        if (pageModel.getTotalPages() != 0 && pageModel.getNumber() > pageModel.getTotalPages()) {
            pageModel.setNumber(pageModel.getTotalPages());
        }
        if (pageModel.getNumber() == 1) pageModel.setFirst(true);
        if (pageModel.getNumber() == pageModel.getTotalPages()) pageModel.setLast(true);
        int[] range = {(pageModel.getNumber() - 1) * pageModel.getSize(), pageModel.getSize()};
        List<Product> models = productRepository.findAll("select product" + jpql, params.toArray(), range, pageModel.getSort());
        pageModel.setContent(models == null ? new ArrayList<>() : models);
        return pageModel;
    }

    public Product create(Product model) {
        if (StringUtils.isNotBlank(model.getId())) {
            throw new BadRequestException(messageSource.getMessage("error.create", null, LocaleContextHolder.getLocale()));
        }
        model.setId(UUID.randomUUID().toString());
        return productRepository.save(model);
    }

    public Product update(Product model) {
        if (StringUtils.isBlank(model.getId())) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        Product entity = productRepository.findById(model.getId()).orElse(null);
        if (entity == null) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }
        if (StringUtils.isNotBlank(model.getName())) {
            entity.setName(model.getName());
        }
        entity.setCode(model.getCode());
        entity.setPrice(model.getPrice());
        entity.setDescription(model.getDescription());
        entity.setPictures(model.getPictures());
        entity.setAttachments(model.getAttachments());
        entity.setSale(model.getSale());

        return productRepository.save(entity);
    }

    public synchronized Product uploadPictures(MultipartFile[] pictures, String id) throws IOException {

        Product entity;
        if (StringUtils.isBlank(id)) {
            entity = new Product();
            entity.setId(UUID.randomUUID().toString());
            entity.setName(messageSource.getMessage("draft", null, LocaleContextHolder.getLocale()));
        } else {
            entity = productRepository.findById(id).orElse(null);
            if (entity == null) {
                throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
            }
        }

        String uploadPath = applicationConfig.getUpload().getPath() + "/product/" + entity.getId() + "/";
        Path path = Paths.get(uploadPath);
        Files.createDirectories(path);

        for (MultipartFile picture : pictures) {
            String fileNameWithoutExt = UUID.randomUUID().toString();
            String fileNameExt = picture.getOriginalFilename().substring(picture.getOriginalFilename().lastIndexOf("."));
            String fileName = fileNameWithoutExt + fileNameExt;
            String fileNameOrginal = fileNameWithoutExt + "_original" + fileNameExt;
            String fileNameThumbnail = fileNameWithoutExt + "_thumbnail" + fileNameExt;

            Files.copy(picture.getInputStream(), Paths.get(uploadPath + fileNameOrginal), StandardCopyOption.REPLACE_EXISTING);
            ImageUtils.createThumbnail(uploadPath + fileNameOrginal, uploadPath + fileName, ImageUtils.MAX_WIDTH, ImageUtils.MAX_HEIGHT, ImageUtils.AspectRatio.CONTAIN);
            ImageUtils.createThumbnail(uploadPath + fileNameOrginal, uploadPath + fileNameThumbnail, ImageUtils.THUMB_WIDTH, ImageUtils.THUMB_HEIGHT, ImageUtils.AspectRatio.COVER);

            if (!StringUtils.isBlank(entity.getPictures())) {
                boolean existing = false;
                for (String existingPicture : entity.getPictures().split(",")) {
                    if (existingPicture.equals(fileName)) {
                        existing = true;
                        break;
                    }
                }
                if (!existing) {
                    entity.setPictures(entity.getPictures() + "," + fileName);
                }
            } else {
                entity.setPictures(fileName);
            }
        }
        return productRepository.save(entity);
    }


    public Product deletePicture(String id, String fileName) throws IOException {

        if (StringUtils.isBlank(id)) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        Product entity = productRepository.findById(id).orElse(null);
        if (entity == null) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        String uploadPath = applicationConfig.getUpload().getPath() + "/product/" + entity.getId() + "/";
        String fileNameExt = fileName.substring(fileName.lastIndexOf("."));
        String fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
        String fileNameOrg = fileNameWithoutExt + "_original" + fileNameExt;
        String fileNameThumbnail = fileNameWithoutExt + "_thumbnail" + fileNameExt;

        Files.deleteIfExists(Paths.get(uploadPath + fileNameOrg));
        Files.deleteIfExists(Paths.get(uploadPath + fileNameThumbnail));
        Files.deleteIfExists(Paths.get(uploadPath + fileName));

        if (!StringUtils.isBlank(entity.getPictures())) {
            List<String> pictures = new ArrayList<>(Arrays.asList(entity.getPictures().split(",")));
            pictures.remove(fileName);
            entity.setPictures(String.join(",", pictures));
            productRepository.save(entity);
        }
        return entity;
    }

    public synchronized Product uploadAttachments(MultipartFile[] attachments, String id) throws IOException {

        Product entity;
        if (StringUtils.isBlank(id)) {
            entity = new Product();
            entity.setId(UUID.randomUUID().toString());
            entity.setName(messageSource.getMessage("draft", null, LocaleContextHolder.getLocale()));
        } else {
            entity = productRepository.findById(id).orElse(null);
            if (entity == null) {
                throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
            }
        }

        String uploadPath = applicationConfig.getUpload().getPath() + "/product/" + entity.getId() + "/";
        Path path = Paths.get(uploadPath);
        Files.createDirectories(path);

        for (MultipartFile attachment : attachments) {
            Files.copy(attachment.getInputStream(), Paths.get(uploadPath + attachment.getOriginalFilename()), StandardCopyOption.REPLACE_EXISTING);

            if (!StringUtils.isBlank(entity.getAttachments())) {
                boolean existing = false;
                for (String existingAttachment : entity.getAttachments().split(",")) {
                    if (existingAttachment.equals(attachment.getOriginalFilename())) {
                        existing = true;
                        break;
                    }
                }
                if (!existing) {
                    entity.setAttachments(entity.getAttachments() + "," + attachment.getOriginalFilename());
                }
            } else {
                entity.setAttachments(attachment.getOriginalFilename());
            }
        }
        return productRepository.save(entity);
    }


    public Product deleteAttachment(String id, String fileName) throws IOException {

        if (StringUtils.isBlank(id)) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        Product entity = productRepository.findById(id).orElse(null);
        if (entity == null) {
            throw new BadRequestException(messageSource.getMessage("error.update", null, LocaleContextHolder.getLocale()));
        }

        String uploadPath = applicationConfig.getUpload().getPath() + "/product/" + entity.getId() + "/";
        Files.deleteIfExists(Paths.get(uploadPath + fileName));

        if (!StringUtils.isBlank(entity.getAttachments())) {
            List<String> attachments = new ArrayList<>(Arrays.asList(entity.getAttachments().split(",")));
            attachments.remove(fileName);
            entity.setAttachments(String.join(",", attachments));
            productRepository.save(entity);
        }
        return entity;
    }

    @Transactional(readOnly = true)
    public PageModel<Product> listSaleProducts(String path) {

        PageModel<Product> pageModel = new PageModel<>();

        StringBuilder jpql = new StringBuilder().append(" from Product product where product.deleted = false and product.sale = true");
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
                    for (Field field : Product.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("product." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                    for (Field field : AbstractEntity.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(sortArray[0])) {
                            pageModel.getSort().put("product." + sortArray[0], sortArray.length == 2 && sortArray[1].equalsIgnoreCase("desc") ? "desc" : "asc");
                            break;
                        }
                    }
                } else {
                    for (Field field : Product.class.getDeclaredFields()) {
                        if (field.getName().equalsIgnoreCase(key)) {
                            if (field.getType().equals(String.class)) {
                                params.add("%" + value.replace(" ", "%") + "%");
                                jpql.append(" and product.").append(field.getName()).append(" like ?").append(params.size());
                            } else if (field.getType().equals(Boolean.class)) {
                                params.add(Boolean.valueOf(value));
                                jpql.append(" and product.").append(field.getName()).append(" = ?").append(params.size());
                            }
                            break;
                        }
                    }
                }
            }
        }

        if (pageModel.getNumber() == 0) pageModel.setNumber(1);
        if (pageModel.getSize() == 0) pageModel.setSize(applicationConfig.getPage().getSize());
        if (pageModel.getSort().isEmpty()) pageModel.getSort().put("product.lastModifiedDate", "desc");

        pageModel.setTotalElements(productRepository.count("select count(product)" + jpql, params.toArray()));
        pageModel.setTotalPages((int) (pageModel.getTotalElements() + pageModel.getSize() - 1) / pageModel.getSize());
        if (pageModel.getTotalPages() != 0 && pageModel.getNumber() > pageModel.getTotalPages()) {
            pageModel.setNumber(pageModel.getTotalPages());
        }
        if (pageModel.getNumber() == 1) pageModel.setFirst(true);
        if (pageModel.getNumber() == pageModel.getTotalPages()) pageModel.setLast(true);
        int[] range = {(pageModel.getNumber() - 1) * pageModel.getSize(), pageModel.getSize()};
        List<Product> models = productRepository.findAll("select product" + jpql, params.toArray(), range, pageModel.getSort());
        pageModel.setContent(models == null ? new ArrayList<>() : models);
        return pageModel;
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
