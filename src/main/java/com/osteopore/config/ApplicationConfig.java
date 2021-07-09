package com.osteopore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@ConfigurationProperties("application")
public class ApplicationConfig {

    private Page page;

    private Upload upload;

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }

    public Upload getUpload() {
        return upload;
    }

    public void setUpload(Upload upload) {
        this.upload = upload;
    }

    public static class Page {

        private int size;
        private int pagination;

        public int getSize() {
            return size;
        }

        public void setSize(int size) {
            this.size = size;
        }

        public int getPagination() {
            return pagination;
        }

        public void setPagination(int pagination) {
            this.pagination = pagination;
        }
    }

    public static class Upload {

        private String path;

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }
    }

    @Bean
    public void initializeUploadPath() throws IOException {
        Path path = Paths.get(getUpload().getPath());
        Files.createDirectories(path);
    }
}
