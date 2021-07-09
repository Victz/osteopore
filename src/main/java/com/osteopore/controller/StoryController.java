package com.osteopore.controller;

import com.osteopore.config.ApplicationConfig;
import com.osteopore.domain.Story;
import com.osteopore.model.PageModel;
import com.osteopore.repository.StoryRepository;
import com.osteopore.service.StoryService;
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
public class StoryController {

    private final Logger log = LoggerFactory.getLogger(StoryController.class);
    @Autowired
    private ApplicationConfig applicationConfig;

    @Autowired
    private StoryService storyService;
    @Autowired
    private StoryRepository storyRepository;

    @GetMapping("/admin/stories/**")
    public PageModel<Story> list(HttpServletRequest request) {

        String path = request.getRequestURI().substring("/api/admin/stories".length());
        log.debug("REST request to get all stories. Path: " + path);
        return storyService.list(path);
    }

    @DeleteMapping("/admin/story/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.debug("REST request to delete story: {}", id);
        Story entity = storyRepository.findById(id).get();
        entity.setDeleted(true);
        storyRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/story/{id}")
    public ResponseEntity<Story> details(@PathVariable String id) {
        log.debug("REST request to get story: {}", id);
        Optional<Story> model = storyRepository.findById(id);
        return model.map(entity -> ResponseEntity.ok().body(entity))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/admin/story")
    public ResponseEntity<Story> create(@Valid @RequestBody Story model) {
        log.debug("REST request to create story: {}", model);
        Story entity = storyService.create(model);
        return ResponseEntity.ok().body(entity);
    }

    @PutMapping("/admin/story")
    public ResponseEntity<Story> update(@RequestBody Story model) {
        log.debug("REST request to update model: {}", model);
        Story entity = storyService.update(model);
        return ResponseEntity.ok().body(entity);
    }

    @PostMapping("/admin/story/pictures")
    public ResponseEntity<Story> uploadPictures(@RequestParam("pictures") MultipartFile[] pictures,
                                                  @RequestParam(name = "id", required = false) String id) throws IOException {
        log.debug("REST request to upload story pictures: {}", pictures);
        Story entity = storyService.uploadPictures(pictures, id);
        return ResponseEntity.ok().body(entity);
    }

    @GetMapping(value = "/story/{id}/picture/{fileName:.+}",
            produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_GIF_VALUE, MediaType.IMAGE_PNG_VALUE})
    public @ResponseBody
    byte[] getPicture(@PathVariable String id,
                      @PathVariable String fileName) throws IOException {

        Path picturePath = Paths.get(applicationConfig.getUpload().getPath() + "/story/" + id + "/" + fileName);
        return Files.readAllBytes(picturePath);
    }

    @DeleteMapping("/admin/story/{id}/picture/{fileName:.+}")
    public ResponseEntity<Story> deletePicture(@PathVariable String id, @PathVariable String fileName) throws IOException {
        log.debug("REST request to delete story: {}, Picture: {}", id, fileName);
        Story entity = storyService.deletePicture(id, fileName);
        return ResponseEntity.ok().body(entity);
    }

    @PostMapping("/admin/story/attachments")
    public ResponseEntity<Story> uploadAttachments(@RequestParam("attachments") MultipartFile[] attachments,
                                                     @RequestParam(name = "id", required = false) String id) throws IOException {
        log.debug("REST request to upload story attachments: {}", attachments);
        Story entity = storyService.uploadAttachments(attachments, id);
        return ResponseEntity.ok().body(entity);
    }

    @GetMapping("/story/{id}/attachment/{fileName:.+}")
    public ResponseEntity<Resource> getAttachment(@PathVariable String id,
                                                  @PathVariable String fileName) throws IOException {

        Path path = Paths.get(applicationConfig.getUpload().getPath() + "/story/" + id + "/" + fileName);
        ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-disposition", "attachment; filename=" + fileName)
                .body(resource);
    }

    @DeleteMapping("/admin/story/{id}/attachment/{fileName:.+}")
    public ResponseEntity<Story> deleteAttachment(@PathVariable String id, @PathVariable String fileName) throws IOException {
        log.debug("REST request to delete story: {}, attachment: {}", id, fileName);
        Story entity = storyService.deleteAttachment(id, fileName);
        return ResponseEntity.ok().body(entity);
    }

}
