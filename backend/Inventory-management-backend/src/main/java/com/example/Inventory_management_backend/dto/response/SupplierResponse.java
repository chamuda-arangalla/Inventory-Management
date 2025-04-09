package com.example.Inventory_management_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupplierResponse {

    private long id;
    private String name;
    private String address;
    private String email;
    private String phone;
}
