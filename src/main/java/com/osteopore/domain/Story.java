package com.osteopore.domain;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

/**
 *
 * @author Shawn
 */
@Entity
@Table(name = "STORY")
@JsonPropertyOrder(value = {"title", "index","published", "views"})
public class Story extends AbstractEntity {

    @Column(name = "TITLE")
    private String title;

    @Column(name = "LINK")
    private String link;

    @Column(name = "[INDEX]")
    private Integer index;

    @Column(name = "CONTENT", length = 5000)
    private String content;

    @Column(name = "PICTURES")
    private String pictures;

    @Column(name = "ATTACHMENTS", length = 500)
    private String attachments;

    @Column(name = "PUBLISHED")
    private Boolean published;

    @Column(name = "VIEWS")
    private Integer views;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Integer getIndex() {
        return index;
    }

    public void setIndex(Integer index) {
        this.index = index;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public Boolean getPublished() {
        return published;
    }

    public void setPublished(Boolean published) {
        this.published = published;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

}
