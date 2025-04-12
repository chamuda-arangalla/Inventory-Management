package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.SaleRequest;
import com.example.Inventory_management_backend.dto.response.SaleResponse;
import com.example.Inventory_management_backend.model.Sale;

import java.util.List;

public interface SaleService {

    SaleResponse createSale(SaleRequest saleRequest);
    String pointOfSales();
    List<Sale> getAllSales();
}
