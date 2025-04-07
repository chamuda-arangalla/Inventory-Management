package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.UserRequest;
import com.example.Inventory_management_backend.dto.response.UserResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/user")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<UserResponse> save(@RequestBody UserRequest userRequest) throws AllReadyExistsException {
        return ResponseEntity.ok(userService.createUser(userRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable long userId, @RequestBody UserRequest userRequest) throws NotFoundException, AllReadyExistsException {
        return ResponseEntity.ok(userService.updateUser(userId, userRequest));
    }

    @GetMapping("/get-user/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable long userId) throws NotFoundException {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable long userId) throws NotFoundException {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

}
