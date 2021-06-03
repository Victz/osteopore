package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 *
 * @author shawn
 */
@Entity
@Table(name = "[CASE]")
@JsonPropertyOrder(value = {"id", "number", "name", "description", "remark"})
public class Case extends AbstractEntity {

    @ManyToOne
    @JoinColumn(name = "USER")
    private User user;

    @Column(name = "[NUMBER]")
    private String number;

    @Column(name = "NAME")
    private String name;

    @Column(name = "DESCRIPTION", length = 5000)
    private String description;

    @Column(name = "REMARK", length = 500)
    private String remark;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

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

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

}
