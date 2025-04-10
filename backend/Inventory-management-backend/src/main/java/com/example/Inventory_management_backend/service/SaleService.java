package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.SaleRequest;
import com.example.Inventory_management_backend.dto.response.SaleResponse;

public interface SaleService {

    SaleResponse createSale(SaleRequest saleRequest);
}
