package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.Digits;

/**
 *
 * @author Shawn
 */
@Entity
@Table(name = "[ORDER]")
@JsonPropertyOrder(value = {"reference", "amount", "consignee", "phone", "street", "city", "state", "country", "postalCode", "note",
    "status", "shippingDate", "invoiceNumber", "deliveredDate", "salesPerson", "remark"})
public class Order extends AbstractEntity {

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name = "REFERENCE")
    private String reference;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<OrderItem> items;

    @Column(name = "AMOUNT", precision = 18, scale = 5)
    @Digits(integer = 13, fraction = 5)
    private BigDecimal amount;

    @Column(name = "CONSIGNEE")
    private String consignee;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "STREET")
    private String street;

    @Column(name = "CITY")
    private String city;

    @Column(name = "[STATE]")
    private String state;

    @Column(name = "COUNTRY")
    private String country;

    @Column(name = "POSTAL_CODE")
    private String postalCode;

    @Column(name = "NOTE")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "[STATUS]")
    private Status status;

    @Column(name = "SHIPPING_DATE")
    private LocalDate shippingDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<Delivery> delivery;

    @Column(name = "INVOICE_NUMBER")
    private String invoiceNumber;

    @Column(name = "DELIVERED_DATE")
    private LocalDate deliveredDate;

    @Column(name = "SALES_PERSON")
    private String salesPerson;

    @Column(name = "REMARK", length = 500)
    private String remark;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Set<OrderItem> getItems() {
        return items;
    }

    public void setItems(Set<OrderItem> items) {
        this.items = items;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getConsignee() {
        return consignee;
    }

    public void setConsignee(String consignee) {
        this.consignee = consignee;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getShippingDate() {
        return shippingDate;
    }

    public void setShippingDate(LocalDate shippingDate) {
        this.shippingDate = shippingDate;
    }

    public Set<Delivery> getDelivery() {
        return delivery;
    }

    public void setDelivery(Set<Delivery> delivery) {
        this.delivery = delivery;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDate getDeliveredDate() {
        return deliveredDate;
    }

    public void setDeliveredDate(LocalDate deliveredDate) {
        this.deliveredDate = deliveredDate;
    }

    public String getSalesPerson() {
        return salesPerson;
    }

    public void setSalesPerson(String salesPerson) {
        this.salesPerson = salesPerson;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public enum Status {

        AWAITING_CONFIRMATION("Awaiting Confirmation", "待确认"),
        PROESSING("Processing", "正在处理"),
        IN_DELIVERY("In Delivery", "运输中"),
        DELIVERED("Delivered", "已送达"),
        CANCELLED("Cancelled", "已取消");

        private String description;
        private String decriptionInChinese;

        private Status(String description, String decriptionInChinese) {
            this.description = description;
            this.decriptionInChinese = decriptionInChinese;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getDecriptionInChinese() {
            return decriptionInChinese;
        }

        public void setDecriptionInChinese(String decriptionInChinese) {
            this.decriptionInChinese = decriptionInChinese;
        }
    }

}
