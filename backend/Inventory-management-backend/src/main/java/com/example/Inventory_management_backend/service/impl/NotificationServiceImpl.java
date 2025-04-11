package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private ProductRepository productRepository;


    @Override
    public List<String> getExpiringProducts() {

        List<Product> products = productRepository.findAll();
        LocalDate today = LocalDate.now();

        return  products.stream()
                .filter(product -> product.getExpiryDate() != null)
                .filter(product -> {
                    long daysLeft = ChronoUnit.DAYS.between(today, product.getExpiryDate());
                    return daysLeft <= 7;
                })
                .map(product -> {
                    long daysLeft = ChronoUnit.DAYS.between(today, product.getExpiryDate());

                    if(daysLeft > 0){
                        return product.getProductName() + "(product id: "+product.getId()+") will expire in " + daysLeft + " days";
                    }
                    else if(daysLeft == 0){
                        return product.getProductName() + "(product id: "+product.getId()+") will expire today";
                    }
                    else if(daysLeft == -1){
                        return product.getProductName() + "(product id: "+product.getId()+") expired yesterday";
                    }
                    else{
                        return product.getProductName() + "(product id: "+product.getId()+") expired before " + Math.abs(daysLeft) + " days";
                    }
                })
                .toList();
    }
}
