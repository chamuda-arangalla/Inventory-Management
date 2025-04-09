package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.SupplierRequest;
import com.example.Inventory_management_backend.dto.response.SupplierResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.service.SupplierService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/supplier")
@AllArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping("/save")
    public ResponseEntity<SupplierResponse> save(@RequestBody SupplierRequest supplierRequest) throws AllReadyExistsException {
        return ResponseEntity.ok(supplierService.createSupplier(supplierRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<List<SupplierResponse>> getAllSupplier() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @PutMapping("/update/{supplierId}")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable long supplierId, @RequestBody SupplierRequest supplierRequest) throws NotFoundException, AllReadyExistsException {
        return ResponseEntity.ok(supplierService.updateSupplier(supplierId, supplierRequest));
    }

    @GetMapping("/get-supplier/{supplierId}")
    public ResponseEntity<SupplierResponse> getSupplier(@PathVariable long supplierId) throws NotFoundException {
        return ResponseEntity.ok(supplierService.getSupplier(supplierId));
    }

    @DeleteMapping("/delete/{supplierId}")
    public ResponseEntity<String> deleteSupplier(@PathVariable long supplierId) throws NotFoundException {
        supplierService.deleteSupplier(supplierId);
        return ResponseEntity.ok("Delete supplier successfully");
    }
}
