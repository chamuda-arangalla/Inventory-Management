package com.example.Inventory_management_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private StockStatus stockStatus;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;;

}
