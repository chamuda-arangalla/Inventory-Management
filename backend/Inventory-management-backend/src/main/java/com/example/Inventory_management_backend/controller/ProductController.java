package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.InvalidDateException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product")
@AllArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/save")
    public ResponseEntity<ProductResponse> save(@RequestBody ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException {
        return ResponseEntity.ok(productService.createProduct(productRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long productId, @RequestBody ProductRequest productRequest) throws NotFoundException,AllReadyExistsException, InvalidDateException {
        return ResponseEntity.ok(productService.updateProduct(productId, productRequest));
    }

    @GetMapping("/get-product/{productId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long productId) throws NotFoundException {
        return ResponseEntity.ok(productService.getProduct(productId));
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) throws NotFoundException {
        productService.deleteProduct(productId);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
