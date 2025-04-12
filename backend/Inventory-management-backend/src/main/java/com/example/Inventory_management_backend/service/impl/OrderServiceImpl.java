package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.OrderRequest;
import com.example.Inventory_management_backend.dto.response.OrderResponse;
import com.example.Inventory_management_backend.dto.response.ProductDto;
import com.example.Inventory_management_backend.model.Order;
import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.repository.OrderRepository;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private OrderRepository orderRepository;
    private ProductRepository productRepository;

    @Override
    public OrderResponse createOrder(OrderRequest orderRequest) {

        List<Product> products = productRepository.findAllById(orderRequest.getProductIds());

        Double totalAmount = 0.0;
        for(Product product : products){
            totalAmount += product.getUnitPrice();
        }

        Order order = new Order();
        order.setOrderDate(LocalDate.now());
        order.setProducts(products);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        List<ProductDto> productDtos = new ArrayList<>();
        for(Product product : products){
            ProductDto dto = ProductDto.builder()
                    .id(product.getId())
                    .productName(product.getProductName())
                    .description(product.getDescription())
                    .category(product.getCategory())
                    .unitPrice(product.getUnitPrice())
                    .build();

            productDtos.add(dto);
        }
        return OrderResponse.builder()
                .orderDate(savedOrder.getOrderDate())
                .products(productDtos)
                .totalAmount(savedOrder.getTotalAmount())
                .build();
    }

    @Override
    public List<Order> getAllOrders() {

        List<Order> foundOrders = orderRepository.findAll();
        return foundOrders;
    }
}
