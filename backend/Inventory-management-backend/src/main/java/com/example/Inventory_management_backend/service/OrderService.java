package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.OrderRequest;
import com.example.Inventory_management_backend.dto.response.OrderResponse;

public interface OrderService {

    OrderResponse createOrder(OrderRequest orderRequest);
}
