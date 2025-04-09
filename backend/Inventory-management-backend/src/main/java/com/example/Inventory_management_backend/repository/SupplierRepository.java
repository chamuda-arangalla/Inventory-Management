package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Supplier findByEmail(String email);
}
