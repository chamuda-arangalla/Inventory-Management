package com.example.Inventory_management_backend.dto.response;

import com.example.Inventory_management_backend.model.Inventory;
import com.example.Inventory_management_backend.model.Supplier;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ProductResponse {

    private Long id;
    private String productName;
    private String description;
    private String category;
    private int quantityInStock;
    private Double unitPrice;
    private LocalDate expiryDate;
    private SupplierResponse supplier;
    private InventoryResponse inventory;
}
