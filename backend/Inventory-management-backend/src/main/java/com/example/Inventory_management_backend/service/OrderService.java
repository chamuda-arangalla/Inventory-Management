package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.OrderRequest;
import com.example.Inventory_management_backend.dto.response.OrderResponse;
import com.example.Inventory_management_backend.model.Order;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest orderRequest);
    List<Order> getAllOrders();
}
