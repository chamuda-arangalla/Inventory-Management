package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale,Long> {

    List<Sale> findAllByDate(LocalDate date);
}
