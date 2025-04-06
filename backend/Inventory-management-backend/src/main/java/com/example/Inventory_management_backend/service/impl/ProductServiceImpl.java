package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.InvalidDateException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;


    @Override
    public ProductResponse createProduct(ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException {
        // Validate product name exist and expiry date
        validateProductRequest(productRequest);

        Product product = new Product();

        // Set product details
        setProductDetails(productRequest, product);

        productRepository.save(product);

        return mapToProductResponse(product);

    }

    @Override
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::mapToProductResponse).collect(Collectors.toList());
    }

    @Override
    public ProductResponse updateProduct(long productId, ProductRequest productRequest) throws NotFoundException, AllReadyExistsException, InvalidDateException {
        Product product = productRepository.findById((productId))
                .orElseThrow(() -> new NotFoundException("Product not found"));

        // Validate product name exist and expiry date
        validateProductRequest(productRequest);
        // Set product details
        setProductDetails(productRequest, product);

        productRepository.save(product);

        return mapToProductResponse(product);
    }

    @Override
    public ProductResponse getProduct(long productId) throws NotFoundException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with product id: " + productId));

        return mapToProductResponse(product);
    }

    @Override
    public void deleteProduct(long productId) throws NotFoundException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with product id: " + productId));

        productRepository.delete(product);
    }

    private void validateProductRequest(ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException {

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

    }

    private void setProductDetails(ProductRequest productRequest, Product product) {
        product.setProductName(productRequest.getProductName());
        product.setDescription(productRequest.getDescription());
        product.setCategory(productRequest.getCategory());
        product.setQuantityInStock(productRequest.getQuantityInStock());
        product.setUnitPrice(productRequest.getUnitPrice());
        product.setExpiryDate(productRequest.getExpiryDate());
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .category(product.getCategory())
                .quantityInStock(product.getQuantityInStock())
                .unitPrice(product.getUnitPrice())
                .expiryDate(product.getExpiryDate())
                .build();
    }
}
