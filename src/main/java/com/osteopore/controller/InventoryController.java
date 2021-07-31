package com.osteopore.controller;

import com.osteopore.domain.Inventory;
import com.osteopore.model.InventoryModel;
import com.osteopore.model.PageModel;
import com.osteopore.repository.InventoryRepository;
import com.osteopore.service.InventoryService;
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
public class InventoryController {

    private final Logger log = LoggerFactory.getLogger(InventoryController.class);

    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping("/admin/inventories/**")
    public PageModel<Inventory> list(HttpServletRequest request) {

        String path = request.getRequestURI().substring("/api/admin/inventories".length());
        log.debug("REST request to get all inventories. Path: " + path);
        return inventoryService.list(path);
    }

    @DeleteMapping("/admin/inventory/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.debug("REST request to delete inventory: {}", id);
        Inventory entity = inventoryRepository.findById(id).get();
        entity.setDeleted(true);
        inventoryRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/inventory/{id}")
    public ResponseEntity<Inventory> details(@PathVariable String id) {
        log.debug("REST request to get inventory: {}", id);
        Optional<Inventory> model = inventoryRepository.findById(id);
        return model.map(entity -> ResponseEntity.ok().body(entity))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/admin/inventory")
    public ResponseEntity<Inventory> create(@Valid @RequestBody InventoryModel model) {
        log.debug("REST request to create inventory: {}", model);
        Inventory entity = inventoryService.create(model);
        return ResponseEntity.ok().body(entity);
    }

    @PutMapping("/admin/inventory")
    public ResponseEntity<Inventory> update(@RequestBody InventoryModel model) {
        log.debug("REST request to update inventory: {}", model);
        Inventory entity = inventoryService.update(model);
        return ResponseEntity.ok().body(entity);
    }
}
