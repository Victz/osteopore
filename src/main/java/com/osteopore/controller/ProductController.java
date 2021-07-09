package com.osteopore.controller;

import com.osteopore.config.ApplicationConfig;
import com.osteopore.domain.Product;
import com.osteopore.model.PageModel;
import com.osteopore.repository.ProductRepository;
import com.osteopore.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final Logger log = LoggerFactory.getLogger(ProductController.class);
    @Autowired
    private ApplicationConfig applicationConfig;

    @Autowired
    private ProductService productService;
    @Autowired
    private ProductRepository productRepository;

    /**
     * {@code GET  /admin/products} : get all products.
     */
    @GetMapping("/admin/products/**")
    public PageModel<Product> list(HttpServletRequest request) {

        String path = request.getRequestURI().substring("/api/admin/products".length());
        log.debug("REST request to get all products. Path: " + path);
        return productService.list(path);
    }

    /**
     * {@code DELETE  /admin/product/:id} : delete the "id" product.
     *
     * @param id the id of the product to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/admin/product/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.debug("REST request to delete Product: {}", id);
        Product product = productRepository.findById(id).get();
        product.setDeleted(true);
        productRepository.save(product);
        return ResponseEntity.noContent().build();
    }

    /**
     * {@code GET  /admin/product/:id} : get the "id" product.
     *
     * @param id the id of the product to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the product, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/admin/product/{id}")
    public ResponseEntity<Product> details(@PathVariable String id) {
        log.debug("REST request to get Product: {}", id);
        Optional<Product> product = productRepository.findById(id);
        return product.map(entity -> ResponseEntity.ok().body(entity))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    /**
     * {@code POST  /admin/product} : Create a new product.
     *
     * @param product the product to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new product, or with status {@code 404 (Not Found)}.
     */
    @PostMapping("/admin/product")
    public ResponseEntity<Product> create(@Valid @RequestBody Product product) {
        log.debug("REST request to create Product: {}", product);
        Product entity = productService.create(product);
        return ResponseEntity.ok().body(entity);
    }

    /**
     * {@code PUT  /admin/product} : Updates an existing product.
     *
     * @param product the product to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated product,
     * or with status {@code 400 (Bad Request)} if the product is not valid,
     * or with status {@code 500 (Internal Server Error)} if the product couldn't be updated.
     */
    @PutMapping("/admin/product")
    public ResponseEntity<Product> update(@RequestBody Product product) {
        log.debug("REST request to update product: {}", product);
        Product entity = productService.update(product);
        return ResponseEntity.ok().body(entity);
    }

    @PostMapping("/admin/product/pictures")
    public ResponseEntity<Product> uploadPictures(@RequestParam("pictures") MultipartFile[] pictures,
                                                  @RequestParam(name = "id", required = false) String id) throws IOException {
        log.debug("REST request to upload product pictures: {}", pictures);
        Product entity = productService.uploadPictures(pictures, id);
        return ResponseEntity.ok().body(entity);
    }

    @GetMapping(value = "/product/{id}/picture/{fileName:.+}",
            produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_GIF_VALUE, MediaType.IMAGE_PNG_VALUE})
    public @ResponseBody
    byte[] getPicture(@PathVariable String id,
                      @PathVariable String fileName) throws IOException {

        Path picturePath = Paths.get(applicationConfig.getUpload().getPath() + "/product/" + id + "/" + fileName);
        return Files.readAllBytes(picturePath);
    }

    @DeleteMapping("/admin/product/{id}/picture/{fileName:.+}")
    public ResponseEntity<Product> deletePicture(@PathVariable String id, @PathVariable String fileName) throws IOException {
        log.debug("REST request to delete Product: {}, Picture: {}", id, fileName);
        Product entity = productService.deletePicture(id, fileName);
        return ResponseEntity.ok().body(entity);
    }

    @PostMapping("/admin/product/attachments")
    public ResponseEntity<Product> uploadAttachments(@RequestParam("attachments") MultipartFile[] attachments,
                                                     @RequestParam(name = "id", required = false) String id) throws IOException {
        log.debug("REST request to upload product attachments: {}", attachments);
        Product entity = productService.uploadAttachments(attachments, id);
        return ResponseEntity.ok().body(entity);
    }

    @GetMapping("/product/{id}/attachment/{fileName:.+}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String id,
                                                  @PathVariable String fileName) throws IOException {

        Path path = Paths.get(applicationConfig.getUpload().getPath() + "/product/" + id + "/" + fileName);
        ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-disposition", "attachment; filename=" + fileName)
                .body(resource);
    }

    @DeleteMapping("/admin/product/{id}/attachment/{fileName:.+}")
    public ResponseEntity<Product> deleteAttachment(@PathVariable String id, @PathVariable String fileName) throws IOException {
        log.debug("REST request to delete Product: {}, attachment: {}", id, fileName);
        Product entity = productService.deleteAttachment(id, fileName);
        return ResponseEntity.ok().body(entity);
    }

}
