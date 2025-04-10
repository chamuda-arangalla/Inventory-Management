package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.UserRequest;
import com.example.Inventory_management_backend.dto.response.UserResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.model.Supplier;
import com.example.Inventory_management_backend.model.User;
import com.example.Inventory_management_backend.model.UserRole;
import com.example.Inventory_management_backend.repository.SupplierRepository;
import com.example.Inventory_management_backend.repository.UserRepository;
import com.example.Inventory_management_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public UserResponse createUser(UserRequest userRequest) throws AllReadyExistsException {
        // Validate username and email
        validateUserRequest(userRequest);

        User user = new User();
        // Set user details
        setUserDetails(userRequest, user);

       User savedUser =  userRepository.save(user);

        if (userRequest.getRole() == UserRole.Supplier){
            Supplier supplier = new Supplier();
            supplier.setUserId(savedUser.getId());
            supplier.setName(savedUser.getName());
            supplier.setEmail(savedUser.getEmail());
            supplier.setPhone(savedUser.getPhone());

            supplierRepository.save(supplier);
        }

        return mapToUserResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(long userId, UserRequest userRequest) throws NotFoundException, AllReadyExistsException {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id " + userId));

        // Validate username and email exist
        validateUserRequest(userRequest);
        // Set user details
        setUserDetails(userRequest, existingUser);

        userRepository.save(existingUser);

        return mapToUserResponse(existingUser);
    }

    @Override
    public UserResponse getUser(long userId) throws NotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id " + userId));

        return mapToUserResponse(user);
    }

    @Override
    public void deleteUser(long userId) throws NotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id " + userId));

        userRepository.delete(user);
    }

    private void validateUserRequest(UserRequest userRequest) throws AllReadyExistsException {

        // Check the email already exists
        User existEmail = userRepository.findByEmail(userRequest.getEmail());
        if (existEmail != null) {
            throw new AllReadyExistsException("Email address already exists");
        }
        // Check the username already exists
        User existUsername = userRepository.findByUsername(userRequest.getUsername());
        if (existUsername != null) {
            throw new AllReadyExistsException("Username already exists");
        }
    }

    private void setUserDetails(UserRequest userRequest, User user) {
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        user.setRole(userRequest.getRole());

        user.setUsername(userRequest.getUsername());
        user.setPassword(userRequest.getPassword());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(String.valueOf(user.getRole()))
                .username(user.getUsername())
                .password(user.getPassword())
                .build();
    }
}
