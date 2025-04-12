package com.example.Inventory_management_backend.repository;


import com.example.Inventory_management_backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Product findByProductName(String productName);
}
