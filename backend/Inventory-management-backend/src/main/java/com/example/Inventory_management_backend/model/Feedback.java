package com.example.Inventory_management_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String feedback;
    private int starRating;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
