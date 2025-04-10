package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.OrderRequest;
import com.example.Inventory_management_backend.dto.response.OrderResponse;
import com.example.Inventory_management_backend.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("api/v1/order")
public class OrderController {

    private OrderService orderService;

    @PostMapping("/save")
    public OrderResponse createOrder(@RequestBody OrderRequest orderRequest){
        return orderService.createOrder(orderRequest);
    }
}
