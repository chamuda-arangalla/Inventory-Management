package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale,Long> {
}
