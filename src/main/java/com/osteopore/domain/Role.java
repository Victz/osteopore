package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * An authority (a security role) used by Spring Security.
 */
@Entity
@Table(name = "ROLE")
@JsonPropertyOrder({"id", "name", "description", "createdBy", "createdDate", "lastModifiedBy", "lastModifiedDate"})
public class Role extends AbstractEntity {

    @NotNull
    @Size(max = 50)
    @Column(name = "NAME", length = 50)
    private String name;

    @Size(max = 500)
    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
