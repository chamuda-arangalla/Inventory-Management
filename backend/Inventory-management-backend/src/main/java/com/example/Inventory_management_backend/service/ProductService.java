package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.InvalidDateException;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException;
    List<ProductResponse> getAllProducts();
    ProductResponse updateProduct(ProductRequest productRequest);
    ProductResponse getProduct(long productId);
    void deleteProduct(long productId);
}
