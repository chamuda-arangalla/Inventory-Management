package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {

    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'CONFIRM'")
    List<Order> findAllByConfirmOrders();
}
