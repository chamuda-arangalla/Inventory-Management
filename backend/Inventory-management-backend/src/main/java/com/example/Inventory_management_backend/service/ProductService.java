package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.InvalidDateException;
import com.example.Inventory_management_backend.exception.NotFoundException;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException, NotFoundException;
    List<ProductResponse> getAllProducts();
    ProductResponse updateProduct(long productId, ProductRequest productRequest) throws NotFoundException, AllReadyExistsException, InvalidDateException;
    ProductResponse getProduct(long productId) throws NotFoundException;
    void deleteProduct(long productId) throws NotFoundException;
}
