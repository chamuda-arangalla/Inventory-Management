package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.SaleRequest;
import com.example.Inventory_management_backend.dto.response.SaleResponse;
import com.example.Inventory_management_backend.model.Sale;
import com.example.Inventory_management_backend.service.SaleService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("api/v1/sale")
@CrossOrigin("*")
public class SaleController {

    private SaleService saleService;

    @PostMapping("/")
    public SaleResponse createSale(@RequestBody SaleRequest saleRequest){
     return saleService.createSale(saleRequest);
    }

    @GetMapping("/")
    public String pointOfSales(){
       return saleService.pointOfSales();
    }

    @GetMapping("/all")
    public List<Sale> getAllSales(){
        return saleService.getAllSales();
    }
}
