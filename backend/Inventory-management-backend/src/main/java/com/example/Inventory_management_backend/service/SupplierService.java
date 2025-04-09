package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.SupplierRequest;
import com.example.Inventory_management_backend.dto.response.SupplierResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.NotFoundException;

import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(SupplierRequest supplierRequest) throws AllReadyExistsException;
    List<SupplierResponse> getAllSuppliers();
    SupplierResponse updateSupplier(long supplierId, SupplierRequest supplierRequest) throws NotFoundException, AllReadyExistsException;
    SupplierResponse getSupplier(long supplierId) throws NotFoundException;
    void deleteSupplier(long supplierId) throws NotFoundException;
}
