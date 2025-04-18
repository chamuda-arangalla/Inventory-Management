package com.example.Inventory_management_backend.dto.response;

import com.example.Inventory_management_backend.model.OrderStatus;
import com.example.Inventory_management_backend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private LocalDate orderDate;
    private List<ProductDto> products;
    private OrderStatus status;
    private Double totalAmount;
}

