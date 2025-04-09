package com.example.Inventory_management_backend.dto.request;

import lombok.Data;

@Data
public class SupplierRequest {

    private String name;
    private String address;
    private String email;
    private String phone;
}
