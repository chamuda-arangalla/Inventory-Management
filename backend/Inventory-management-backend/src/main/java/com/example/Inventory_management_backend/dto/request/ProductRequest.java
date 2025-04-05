package com.example.Inventory_management_backend.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductRequest {

    private String productName;
    private String description;
    private String category;
    private int quantityInStock;
    private Double unitPrice;
    private LocalDate expiryDate;
}
