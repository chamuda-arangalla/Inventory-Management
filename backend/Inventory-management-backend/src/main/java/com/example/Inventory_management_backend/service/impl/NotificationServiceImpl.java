package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private ProductRepository productRepository;


    @Override
    public List<String> getExpiringProducts() {

        List<Product> products = productRepository.findAll();
        LocalDate today = LocalDate.now();


    }
}
