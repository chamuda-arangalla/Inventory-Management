package com.example.Inventory_management_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class UserDto {

    private String role;
    private String username;
    private String password;
    private Long id;

    public UserDto(String role, String username, String password, Long id) {
        this.role = role;
        this.username = username;
        this.password = password;
        this.id = id;
    }
}
