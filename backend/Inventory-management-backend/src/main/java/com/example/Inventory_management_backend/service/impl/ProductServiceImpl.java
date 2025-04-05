package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.InvalidDateException;
import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;


    @Override
    public ProductResponse createProduct(ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException {
        Product product = new Product();
        LocalDate currentDate = LocalDate.now();

        // Check the product name exists in the database
        Product existProduct = productRepository.findByProductName(productRequest.getProductName());
        if (existProduct != null) {
            throw new AllReadyExistsException("Product already exists");
        }
        // Check the expiry date is valid
        if(productRequest.getExpiryDate().isBefore(currentDate)){
            throw new InvalidDateException("Expiry Date is invalid");
        }

        product.setProductName(productRequest.getProductName());
        product.setDescription(productRequest.getDescription());
        product.setCategory(productRequest.getCategory());
        product.setQuantityInStock(productRequest.getQuantityInStock());
        product.setUnitPrice(productRequest.getUnitPrice());
        product.setExpiryDate(productRequest.getExpiryDate());

        productRepository.save(product);

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .category(product.getCategory())
                .quantityInStock(product.getQuantityInStock())
                .unitPrice(productRequest.getUnitPrice())
                .expiryDate(product.getExpiryDate())
                .build();

    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return List.of();
    }

    @Override
    public ProductResponse updateProduct(ProductRequest productRequest) {
        return null;
    }

    @Override
    public ProductResponse getProduct(long productId) {
        return null;
    }

    @Override
    public void deleteProduct(long productId) {

    }
}
