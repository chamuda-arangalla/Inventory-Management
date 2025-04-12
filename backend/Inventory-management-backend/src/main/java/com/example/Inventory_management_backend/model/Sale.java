package com.example.Inventory_management_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.security.PrivateKey;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private Double totalSale;

    @ManyToMany
    @JoinTable(
            name = "order_sales",
            joinColumns = @JoinColumn(name = "sale_id"),
            inverseJoinColumns = @JoinColumn(name = "order_id")
    )
    private List<Order> orders;
}
