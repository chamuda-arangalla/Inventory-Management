package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.service.ProductService;
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

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testSaveProduct() throws Exception {
        // Prepare a dummy ProductRequest (set any necessary properties)
        ProductRequest productRequest = new ProductRequest();
        // e.g., productRequest.setProductName("Sample Product");

        // Prepare a dummy ProductResponse using the builder
        ProductResponse productResponse = ProductResponse.builder()
                .id(1L)
                .productName("Sample Product")
                .description("This is a sample product")
                .category("Electronics")
                .quantityInStock(100)
                .unitPrice(199.99)
                .expiryDate(LocalDate.now().plusDays(30))
                .supplier(null)      // You can create a dummy SupplierResponse if needed
                .inventory(null)     // You can create a dummy InventoryResponse if needed
                .build();

        Mockito.when(productService.createProduct(any(ProductRequest.class)))
                .thenReturn(productResponse);

        // Perform the POST request and verify the response
        mockMvc.perform(post("/api/v1/product/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.productName").value("Sample Product"));
    }

    @Test
    public void testGetAllProducts() throws Exception {
        // Create dummy ProductResponse objects using the builder
        ProductResponse product1 = ProductResponse.builder()
                .id(1L)
                .productName("Product One")
                .description("Description One")
                .category("Category A")
                .quantityInStock(50)
                .unitPrice(99.99)
                .expiryDate(LocalDate.now().plusDays(15))
                .supplier(null)
                .inventory(null)
                .build();

        ProductResponse product2 = ProductResponse.builder()
                .id(2L)
                .productName("Product Two")
                .description("Description Two")
                .category("Category B")
                .quantityInStock(75)
                .unitPrice(149.99)
                .expiryDate(LocalDate.now().plusDays(20))
                .supplier(null)
                .inventory(null)
                .build();

        List<ProductResponse> products = List.of(product1, product2);
        Mockito.when(productService.getAllProducts()).thenReturn(products);

        // Perform the GET request to retrieve all products
        mockMvc.perform(get("/api/v1/product/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(products.size()));
    }

    @Test
    public void testGetProductBySupplierId() throws Exception {
        long supplierId = 10L;
        ProductResponse product = ProductResponse.builder()
                .id(3L)
                .productName("Supplier Product")
                .description("Product for supplier " + supplierId)
                .category("Category C")
                .quantityInStock(40)
                .unitPrice(79.99)
                .expiryDate(LocalDate.now().plusDays(10))
                .supplier(null)
                .inventory(null)
                .build();

        List<ProductResponse> products = List.of(product);
        Mockito.when(productService.getProductBySupplierId(anyLong())).thenReturn(products);

        // Perform the GET request for products by supplier Id
        mockMvc.perform(get("/api/v1/product/sup-product/{supplierId}", supplierId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(products.size()));
    }

    @Test
    public void testUpdateProduct() throws Exception {
        long productId = 1L;
        ProductRequest productRequest = new ProductRequest();
        // set properties on productRequest as needed

        ProductResponse updatedProduct = ProductResponse.builder()
                .id(productId)
                .productName("Updated Product")
                .description("Updated Description")
                .category("Updated Category")
                .quantityInStock(120)
                .unitPrice(179.99)
                .expiryDate(LocalDate.now().plusDays(45))
                .supplier(null)
                .inventory(null)
                .build();

        Mockito.when(productService.updateProduct(anyLong(), any(ProductRequest.class)))
                .thenReturn(updatedProduct);

        mockMvc.perform(put("/api/v1/product/update/{productId}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId))
                .andExpect(jsonPath("$.productName").value("Updated Product"));
    }

    @Test
    public void testGetProduct() throws Exception {
        long productId = 1L;
        ProductResponse productResponse = ProductResponse.builder()
                .id(productId)
                .productName("Test Product")
                .description("Test Description")
                .category("Test Category")
                .quantityInStock(60)
                .unitPrice(129.99)
                .expiryDate(LocalDate.now().plusDays(25))
                .supplier(null)
                .inventory(null)
                .build();

        Mockito.when(productService.getProduct(productId)).thenReturn(productResponse);

        mockMvc.perform(get("/api/v1/product/get-product/{productId}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId))
                .andExpect(jsonPath("$.productName").value("Test Product"));
    }

    @Test
    public void testDeleteProduct() throws Exception {
        long productId = 1L;
        // For delete, assume no exception is thrown and a success message is returned.
        Mockito.doNothing().when(productService).deleteProduct(productId);

        mockMvc.perform(delete("/api/v1/product/delete/{productId}", productId))
                .andExpect(status().isOk())
                .andExpect(content().string("Product deleted successfully"));
    }
}
