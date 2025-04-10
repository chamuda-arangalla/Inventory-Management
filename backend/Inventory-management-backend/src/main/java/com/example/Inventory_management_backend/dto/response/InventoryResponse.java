package com.example.Inventory_management_backend.dto.response;

import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.model.StockStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryResponse {

    private Long id;
    private Integer quantity;
    private StockStatus stockStatus;
}
