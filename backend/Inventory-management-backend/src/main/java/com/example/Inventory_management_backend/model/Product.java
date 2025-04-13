package com.example.Inventory_management_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

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
    private boolean status;

    @ManyToOne
    @JsonBackReference
    private Supplier supplier;

    @OneToOne(cascade = CascadeType.ALL) // Auto save
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @ManyToMany(mappedBy = "products")
    @JsonBackReference
    private List<Order> orders;
}
