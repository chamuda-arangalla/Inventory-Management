package com.example.Inventory_management_backend.dto.request;

import com.example.Inventory_management_backend.model.Inventory;
import com.example.Inventory_management_backend.model.Supplier;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
    private Long supplierId;
}
