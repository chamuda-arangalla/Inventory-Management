package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.UserRequest;
import com.example.Inventory_management_backend.dto.response.UserResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.model.User;
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

    @Override
    public UserResponse createUser(UserRequest userRequest) throws AllReadyExistsException {
        // Validate username and email
        validateUserRequest(userRequest);

        User user = new User();
        // Set user details
        setUserDetails(userRequest, user);

        userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(long userId, UserRequest userRequest) throws NotFoundException, AllReadyExistsException {
        return null;
    }

    @Override
    public UserResponse getUser(long userId) throws NotFoundException {
        return null;
    }

    @Override
    public void deleteUser(long userId) throws NotFoundException {

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
        user.setUsername(userRequest.getUsername());
        user.setPassword(userRequest.getPassword());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .username(user.getUsername())
                .password(user.getPassword())
                .build();
    }
}
