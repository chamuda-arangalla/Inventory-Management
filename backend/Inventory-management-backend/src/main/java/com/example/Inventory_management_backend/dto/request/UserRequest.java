package com.example.Inventory_management_backend.dto.request;

import com.example.Inventory_management_backend.model.UserRole;
import lombok.Data;

@Data
public class UserRequest {

    private String name;
    private String email;
    private String phone;
    private String username;
    private String password;
    private UserRole role;
}
