package com.example.Inventory_management_backend.dto.request;

import com.example.Inventory_management_backend.model.Product;
import jakarta.persistence.OneToMany;
import lombok.Data;

import java.util.List;

@Data
public class SupplierRequest {

    private String name;
    private String address;
    private String email;
    private String phone;
    private List<Product> products;
}
