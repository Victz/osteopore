package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.Digits;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * @author shawn
 */
@Entity
@Table(name = "PRODUCT")
@JsonPropertyOrder(value = {"id", "name", "code", "price", "description", "pictures", "attachments", "sale", "views", "createdBy", "createdDate", "lastModifiedBy", "lastModifiedDate"})
public class Product extends AbstractEntity {

    @NotBlank(message = "{product.name.validate}")
    @Size(max = 255, message = "{product.name.validate}")
    @Column(name = "NAME")
    private String name;

    @Size(max = 255)
    @Column(name = "CODE")
    private String code;

    @Digits(integer = 18, fraction = 5)
    @Column(name = "PRICE", precision = 18, scale = 5)
    private BigDecimal price;

    @Size(max = 5000)
    @Column(name = "DESCRIPTION", length = 5000)
    private String description;

    @Size(max = 255)
    @Column(name = "PICTURES")
    private String pictures;

    @Size(max = 255)
    @Column(name = "ATTACHMENTS")
    private String attachments;

    @Column(name = "SALE")
    private Boolean sale;

    @Column(name = "views")
    private Long views;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPictures() {
        return pictures;
    }

    public void setPictures(String pictures) {
        this.pictures = pictures;
    }

    public String getAttachments() {
        return attachments;
    }

    public void setAttachments(String attachments) {
        this.attachments = attachments;
    }

    public Boolean getSale() {
        return sale;
    }

    public void setSale(Boolean sale) {
        this.sale = sale;
    }

    public Long getViews() {
        return views;
    }

    public void setViews(Long views) {
        this.views = views;
    }

}
