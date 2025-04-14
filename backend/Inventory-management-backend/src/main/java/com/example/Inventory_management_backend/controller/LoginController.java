package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.LoginRequest;
import com.example.Inventory_management_backend.dto.response.UserDto;
import com.example.Inventory_management_backend.service.impl.LoginServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/login")
@AllArgsConstructor
@CrossOrigin("*")
public class LoginController {

    private final LoginServiceImpl loginService;

    @PostMapping()
    public ResponseEntity<UserDto> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(loginService.userLogin(loginRequest.getUsername(), loginRequest.getPassword()));
    }
}
