package com.example.Inventory_management_backend.dto.response;

import com.example.Inventory_management_backend.model.Product;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SupplierResponse {

    private long id;
    private String name;
    private String address;
    private String email;
    private String phone;
//    private List<Product> products;
}
