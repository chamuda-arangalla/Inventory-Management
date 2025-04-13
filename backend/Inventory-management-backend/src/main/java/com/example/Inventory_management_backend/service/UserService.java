package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.UserRequest;
import com.example.Inventory_management_backend.dto.response.UserResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.model.User;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest userRequest) throws AllReadyExistsException;
    List<UserResponse> getAllUsers();
    UserResponse updateUser(long userId, UserRequest userRequest) throws NotFoundException, AllReadyExistsException;
    UserResponse getUser(long userId) throws NotFoundException;
    void deleteUser(long userId) throws NotFoundException;
    List<UserResponse> getAllEmployees();
    List<UserResponse> getAllSuppliers();
    List<UserResponse> getAllManagers();
}
