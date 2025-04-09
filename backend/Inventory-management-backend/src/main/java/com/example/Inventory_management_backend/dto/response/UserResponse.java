package com.example.Inventory_management_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private String name;
    private String email;
    private String phone;
    private String username;
    private String password;

}
