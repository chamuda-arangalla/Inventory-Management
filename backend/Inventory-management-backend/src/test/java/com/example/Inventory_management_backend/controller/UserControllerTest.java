package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.UserRequest;
import com.example.Inventory_management_backend.dto.response.UserResponse;
import com.example.Inventory_management_backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testSaveUser() throws Exception {
        // Prepare a dummy UserRequest (set properties as required)
        UserRequest userRequest = new UserRequest();
        // e.g., userRequest.setName("New User");

        // Prepare a dummy UserResponse using the builder
        UserResponse userResponse = UserResponse.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .phone("0775351304")
                .role("employee")
                .username("testuser")
                .password("password123")
                .build();

        Mockito.when(userService.createUser(any(UserRequest.class))).thenReturn(userResponse);

        // Perform the POST request and verify response
        mockMvc.perform(post("/api/v1/user/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Test User"));
    }

    @Test
    public void testGetAllUsers() throws Exception {
        // Create dummy responses using Lombok's builder
        UserResponse user1 = UserResponse.builder()
                .id(1L)
                .name("User One")
                .email("one@example.com")
                .phone("1111111")
                .role("employee")
                .username("userone")
                .password("password")
                .build();

        UserResponse user2 = UserResponse.builder()
                .id(2L)
                .name("User Two")
                .email("two@example.com")
                .phone("2222222")
                .role("manager")
                .username("usertwo")
                .password("password")
                .build();

        List<UserResponse> users = List.of(user1, user2);
        Mockito.when(userService.getAllUsers()).thenReturn(users);

        // Perform the GET request
        mockMvc.perform(get("/api/v1/user/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(users.size()));
    }

    @Test
    public void testUpdateUser() throws Exception {
        long userId = 1L;
        UserRequest userRequest = new UserRequest();
        // Set properties on userRequest as required

        UserResponse updatedUser = UserResponse.builder()
                .id(userId)
                .name("Updated User")
                .email("updated@example.com")
                .phone("3333333")
                .role("supplier")
                .username("updateduser")
                .password("newpassword")
                .build();

        Mockito.when(userService.updateUser(anyLong(), any(UserRequest.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/v1/user/update/{userId}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.name").value("Updated User"));
    }

    @Test
    public void testGetUser() throws Exception {
        long userId = 1L;
        UserResponse userResponse = UserResponse.builder()
                .id(userId)
                .name("Test User")
                .email("test@example.com")
                .phone("123456789")
                .role("employee")
                .username("testuser")
                .password("password")
                .build();

        Mockito.when(userService.getUser(userId)).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/user/get-user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId));
    }

    @Test
    public void testDeleteUser() throws Exception {
        long userId = 1L;
        // For delete, assume no exception is thrown and a string response is returned.
        Mockito.doNothing().when(userService).deleteUser(userId);

        mockMvc.perform(delete("/api/v1/user/delete/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(content().string("User deleted successfully"));
    }

    @Test
    public void testGetAllEmployees() throws Exception {
        UserResponse employee1 = UserResponse.builder()
                .id(1L)
                .name("Employee One")
                .email("emp1@example.com")
                .phone("11111111")
                .role("employee")
                .username("empone")
                .password("password")
                .build();

        UserResponse employee2 = UserResponse.builder()
                .id(2L)
                .name("Employee Two")
                .email("emp2@example.com")
                .phone("22222222")
                .role("employee")
                .username("emptwo")
                .password("password")
                .build();

        List<UserResponse> employees = List.of(employee1, employee2);
        Mockito.when(userService.getAllEmployees()).thenReturn(employees);

        mockMvc.perform(get("/api/v1/user/all-employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(employees.size()));
    }

    @Test
    public void testGetAllSuppliers() throws Exception {
        UserResponse supplier = UserResponse.builder()
                .id(3L)
                .name("Supplier")
                .email("supplier@example.com")
                .phone("33333333")
                .role("supplier")
                .username("supplieruser")
                .password("password")
                .build();

        List<UserResponse> suppliers = List.of(supplier);
        Mockito.when(userService.getAllSuppliers()).thenReturn(suppliers);

        mockMvc.perform(get("/api/v1/user/all-suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(suppliers.size()));
    }

    @Test
    public void testGetAllManagers() throws Exception {
        UserResponse manager1 = UserResponse.builder()
                .id(4L)
                .name("Manager One")
                .email("manager1@example.com")
                .phone("44444444")
                .role("manager")
                .username("manager1")
                .password("password")
                .build();
        UserResponse manager2 = UserResponse.builder()
                .id(5L)
                .name("Manager Two")
                .email("manager2@example.com")
                .phone("55555555")
                .role("manager")
                .username("manager2")
                .password("password")
                .build();
        UserResponse manager3 = UserResponse.builder()
                .id(6L)
                .name("Manager Three")
                .email("manager3@example.com")
                .phone("66666666")
                .role("manager")
                .username("manager3")
                .password("password")
                .build();

        List<UserResponse> managers = List.of(manager1, manager2, manager3);
        Mockito.when(userService.getAllManagers()).thenReturn(managers);

        mockMvc.perform(get("/api/v1/user/all-managers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(managers.size()));
    }
}
