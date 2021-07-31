package com.osteopore.controller;

import com.osteopore.domain.Case;
import com.osteopore.model.PageModel;
import com.osteopore.repository.CaseRepository;
import com.osteopore.service.CaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class CaseController {

    private final Logger log = LoggerFactory.getLogger(CaseController.class);

    @Autowired
    private CaseService caseService;
    @Autowired
    private CaseRepository caseRepository;

    @GetMapping("/admin/cases/**")
    public PageModel<Case> list(HttpServletRequest request) {

        String path = request.getRequestURI().substring("/api/admin/cases".length());
        log.debug("REST request to get all cases. Path: " + path);
        return caseService.list(path);
    }

    @DeleteMapping("/admin/case/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.debug("REST request to delete case: {}", id);
        Case entity = caseRepository.findById(id).get();
        entity.setDeleted(true);
        caseRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/case/{id}")
    public ResponseEntity<Case> details(@PathVariable String id) {
        log.debug("REST request to get case: {}", id);
        Optional<Case> model = caseRepository.findById(id);
        return model.map(entity -> ResponseEntity.ok().body(entity))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/admin/case")
    public ResponseEntity<Case> create(@Valid @RequestBody Case model) {
        log.debug("REST request to create case: {}", model);
        Case entity = caseService.create(model);
        return ResponseEntity.ok().body(entity);
    }

    @PutMapping("/admin/case")
    public ResponseEntity<Case> update(@RequestBody Case model) {
        log.debug("REST request to update model: {}", model);
        Case entity = caseService.update(model);
        return ResponseEntity.ok().body(entity);
    }
}
