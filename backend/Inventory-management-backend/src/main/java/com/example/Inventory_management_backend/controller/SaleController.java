package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.SaleRequest;
import com.example.Inventory_management_backend.dto.response.SaleResponse;
import com.example.Inventory_management_backend.service.SaleService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("api/v1/sale")
public class SaleController {

    private SaleService saleService;

    @PostMapping("/")
    public SaleResponse createSale(@RequestBody SaleRequest saleRequest){
     return saleService.createSale(saleRequest);
    }
}
