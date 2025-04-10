package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
}
