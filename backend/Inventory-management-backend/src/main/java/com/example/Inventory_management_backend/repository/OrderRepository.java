package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order,Long> {
}
