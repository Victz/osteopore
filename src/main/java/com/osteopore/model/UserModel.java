package com.osteopore.model;

import javax.persistence.Column;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * A user.
 */
public class UserModel {

    private String id;

    @NotBlank(message = "{user.name.validate}")
    @Size(min = 2, max = 50, message = "{user.name.validate}")
    private String name;

    @NotBlank(message = "{user.username.validate}")
    @Pattern(regexp = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*$", message = "{user.username.validate}")
    @Size(min = 2, max = 50, message = "{user.username.validate}")
    private String username;

    @NotBlank(message = "{user.email.validate}")
    @Pattern(regexp = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$", message = "{user.email.validate}")
    @Column(name = "EMAIL", length = 50, unique = true)
    private String email;

    @Pattern(regexp = "^\\+[0-9]+$", message = "{user.phone.validate}")
    @Size(min = 2, max = 50, message = "{user.phone.validate}")
    private String phone;

    private Boolean activated;

    private List<String> roles;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getActivated() {
        return activated;
    }

    public void setActivated(Boolean activated) {
        this.activated = activated;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
