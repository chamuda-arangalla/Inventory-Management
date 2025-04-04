package com.example.Inventory_management_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;
    private String description;
    private String category;
    private int quantityInStock;
    private Double unitPrice;
    private LocalDate expiryDate;
}
