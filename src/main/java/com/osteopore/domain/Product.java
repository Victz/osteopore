package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.math.BigDecimal;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.Digits;

/**
 *
 * @author shawn
 */
@Entity
@Table(name = "PRODUCT")
@JsonPropertyOrder(value = {"name", "code", "price"})
public class Product extends AbstractEntity {

    @Column(name = "NAME")
    private String name;

    @Column(name = "CODE")
    private String code;

    @Column(name = "PRICE", precision = 18, scale = 5)
    @Digits(integer = 13, fraction = 5)
    private BigDecimal price;

    @Column(name = "DESCRIPTION", length = 5000)
    private String description;

    @Column(name = "PICTURES")
    private String pictures;

    @Column(name = "ATTACHMENTS", length = 500)
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
