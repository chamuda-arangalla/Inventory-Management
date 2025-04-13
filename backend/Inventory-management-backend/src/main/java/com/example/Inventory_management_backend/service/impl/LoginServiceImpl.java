package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.response.UserDto;
import com.example.Inventory_management_backend.model.User;
import com.example.Inventory_management_backend.model.UserRole;
import com.example.Inventory_management_backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class LoginServiceImpl {

    private UserRepository userRepository;

    public UserDto userLogin(String username, String password) {
        String role = null;
        Long userId = null;

        User user = userRepository.findByUsername(username);

        if (user == null) {
            throw new RuntimeException("User not found");
        } else {
            if (user.getPassword().equals(password) && user.getRole().equals(UserRole.Supplier)) {
                role = "Supplier";
                userId = user.getId();
                return new UserDto(role, username, password, userId);
            } else if (user.getPassword().equals(password) && user.getRole().equals(UserRole.Employee)) {
                role = "Employee";
                userId = user.getId();
                return new UserDto(role, username, password, userId);
            } else if (user.getPassword().equals(password) && user.getRole().equals(UserRole.Manager)) {
                role = "Manager";
                userId = user.getId();
                return new UserDto(role, username, password, userId);
            } else throw new RuntimeException("Wrong password");
        }
    }
}
