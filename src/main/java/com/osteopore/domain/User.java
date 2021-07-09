package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * A user.
 */
@Entity
@Table(name = "USER")
@JsonPropertyOrder({"id", "name", "username", "email", "phone", "photo", "cover", "locale", "activated", "roles", "createdBy", "createdDate", "lastModifiedBy", "lastModifiedDate"})
public class User extends AbstractEntity {

    @NotBlank(message = "{user.name.validate}")
    @Size(min = 2, max = 50, message = "{user.name.validate}")
    @Column(name = "NAME", length = 50)
    private String name;

    @Pattern(regexp = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*$", message = "{user.username.validate}")
    @Size(min = 2, max = 50, message = "{user.username.validate}")
    @Column(name = "USERNAME", length = 50, unique = true)
    private String username;

    @NotBlank(message = "{user.email.validate}")
    @Pattern(regexp = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$", message = "{user.email.validate}")
    @Column(name = "EMAIL", length = 50, unique = true)
    private String email;

    @Pattern(regexp = "^\\+[0-9]+$", message = "{user.phone.validate}")
    @Size(min = 2, max = 50, message = "{user.phone.validate}")
    @Column(name = "PHONE", length = 50, unique = true)
    private String phone;

    @NotBlank(message = "{user.password.validate}")
    @Size(min = 8, max = 255, message = "{user.password.validate}")
    @Column(name = "PASSWORD")
    private String password;

    @Size(max = 255)
    @Column(name = "PHOTO")
    private String photo;

    @Size(max = 255)
    @Column(name = "COVER")
    private String cover;

    @Size(min = 2, max = 10)
    @Column(name = "LOCALE", length = 10)
    private String locale;

    @NotNull
    @Column(name = "ACTIVATED")
    private Boolean activated;

    @JsonIgnore
    @Size(max = 255)
    @Column(name = "ACTIVATION_KEY")
    private String activationKey;

    @JsonIgnore
    @Size(max = 255)
    @Column(name = "RESET_KEY")
    private String resetKey;

    @JsonIgnore
    @Column(name = "RESET_DATE")
    private Instant resetDate = null;

    @ManyToMany
    @JoinTable(name = "JOIN_USER_ROLE", joinColumns = {
            @JoinColumn(name = "USER_ID")}, inverseJoinColumns = {
            @JoinColumn(name = "ROLE_ID")})
    private Set<Role> roles = new HashSet<>();

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
        this.username = username.toLowerCase(Locale.ENGLISH);
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

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    @JsonProperty(access = Access.WRITE_ONLY)
    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getCover() {
        return cover;
    }

    public void setCover(String cover) {
        this.cover = cover;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public Boolean getActivated() {
        return activated;
    }

    public void setActivated(Boolean activated) {
        this.activated = activated;
    }

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public String getResetKey() {
        return resetKey;
    }

    public void setResetKey(String resetKey) {
        this.resetKey = resetKey;
    }

    public Instant getResetDate() {
        return resetDate;
    }

    public void setResetDate(Instant resetDate) {
        this.resetDate = resetDate;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

}
