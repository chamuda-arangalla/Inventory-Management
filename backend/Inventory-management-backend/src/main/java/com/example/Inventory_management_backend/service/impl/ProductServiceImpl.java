package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.ProductRequest;
import com.example.Inventory_management_backend.dto.response.InventoryResponse;
import com.example.Inventory_management_backend.dto.response.ProductResponse;
import com.example.Inventory_management_backend.dto.response.SupplierResponse;
import com.example.Inventory_management_backend.exception.AllReadyExistsException;
import com.example.Inventory_management_backend.exception.InvalidDateException;
import com.example.Inventory_management_backend.exception.NotFoundException;
import com.example.Inventory_management_backend.model.Inventory;
import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.model.StockStatus;
import com.example.Inventory_management_backend.model.Supplier;
import com.example.Inventory_management_backend.repository.InventoryRepository;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.repository.SupplierRepository;
import com.example.Inventory_management_backend.service.InventoryService;
import com.example.Inventory_management_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private InventoryService inventoryService;

    @Override
    public ProductResponse createProduct(ProductRequest productRequest) throws AllReadyExistsException, InvalidDateException, NotFoundException {
        // Find supplier exists
        Optional<Supplier> optionalSupplier = supplierRepository.findById(productRequest.getSupplierId());
        if(!optionalSupplier.isPresent()) {
            throw new NotFoundException("Supplier not found with id " + productRequest.getSupplierId());
        }

        Supplier foundSupplier = optionalSupplier.get();
        // Validate expiry date
        validateProductRequest(productRequest);

        Product newProduct = new Product();
        // Set product details
        setProductDetails(productRequest, newProduct);
        // Set supplier
        newProduct.setSupplier(foundSupplier);
        // Set product status
        newProduct.setStatus(true);
        // Set product to supplier
        foundSupplier.getProducts().add(newProduct);

        productRepository.save(newProduct);

        // Create new inventory for the product
        Inventory newInventory = new Inventory();
        newInventory.setProduct(newProduct);
        newInventory.setQuantity(newProduct.getQuantityInStock());
        newInventory.setStockStatus(getStockStatus(newProduct.getQuantityInStock()));

        inventoryRepository.save(newInventory);

        // Set inventory and supplier
        newProduct.setInventory(newInventory);
        productRepository.save(newProduct);

//        supplierRepository.save(supplier);

        return mapToProductResponse(newProduct);

    }

    @Override
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        // Check product available
        List<Product> availableProducts = checkStatus(products);

        return availableProducts.stream().map(this::mapToProductResponse).collect(Collectors.toList());
    }

    @Override
    public ProductResponse updateProduct(long productId, ProductRequest productRequest) throws NotFoundException, AllReadyExistsException, InvalidDateException {
        Product existingProduct = productRepository.findById((productId))
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        if(existingProduct.isStatus() == true) {

            // Validate product name exist and expiry date
            validateProductRequest(productRequest);
            // Set product details
            setProductDetails(productRequest, existingProduct);

            productRepository.save(existingProduct);

            return mapToProductResponse(existingProduct);
        }
        else throw new RuntimeException("Out of stock!!");
    }

    @Override
    public ProductResponse getProduct(long productId) throws NotFoundException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with product id: " + productId));

        if(product.isStatus() == true) {
            return mapToProductResponse(product);
        }
        else throw new RuntimeException("Out of stock!!");
    }

    @Override
    public List<ProductResponse> getProductBySupplierId(long supplierId) throws NotFoundException {
        // Find the supplier first
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new NotFoundException("Supplier not found with id " + supplierId));

        // Retrieve the list of products via the supplier's relationship
        List<Product> products = supplier.getProducts();

        // Check if the supplier has any products
        if (products == null || products.isEmpty()) {
            throw new NotFoundException("No products found for supplier id " + supplierId);
        }
        else {
            // Check product available
            List<Product> availableProducts = checkStatus(products);
            // Map products to ProductResponse DTOs
            return availableProducts.stream().map(this::mapToProductResponse).collect(Collectors.toList());
        }
    }

    @Override
    public void deleteProduct(long productId) throws NotFoundException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with product id: " + productId));

        // Set product status false
        product.setStatus(false);
        productRepository.save(product);
    }

    private void validateProductRequest(ProductRequest productRequest) throws InvalidDateException {

        LocalDate currentDate = LocalDate.now();

        // Check the expiry date is valid
        if(productRequest.getExpiryDate().isBefore(currentDate)){
            throw new InvalidDateException("Expiry Date is invalid");
        }

    }

    private void setProductDetails(ProductRequest productRequest, Product product) {

//       Optional<Supplier> optionalSupplier = supplierRepository.findById(productRequest.getSupplierId());
//
//       if (!optionalSupplier.isPresent()){
//           throw new RuntimeException("supplier not found with id " + productRequest.getSupplierId());
//       }
//
//        Supplier foundSupplier = optionalSupplier.get();

//        product.setSupplier(foundSupplier);
        product.setProductName(productRequest.getProductName());
        product.setDescription(productRequest.getDescription());
        product.setCategory(productRequest.getCategory());
        product.setQuantityInStock(productRequest.getQuantityInStock());
        product.setUnitPrice(productRequest.getUnitPrice());
        product.setExpiryDate(productRequest.getExpiryDate());
    }

    private ProductResponse mapToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .category(product.getCategory())
                .quantityInStock(product.getQuantityInStock())
                .unitPrice(product.getUnitPrice())
                .expiryDate(product.getExpiryDate())
                .supplier(
                        SupplierResponse.builder()
                                .id(product.getSupplier().getId())
                                .name(product.getSupplier().getName())
//                                .address(product.getSupplier().getAddress())
                                .email(product.getSupplier().getEmail())
                                .phone(product.getSupplier().getPhone())
                                .build()
                )
                .inventory(
                        InventoryResponse.builder()
                                .id(product.getInventory().getId())
                                .quantity(product.getInventory().getQuantity())
                                .stockStatus(product.getInventory().getStockStatus())
                                .build()
                )
                .build();

    }

    private StockStatus getStockStatus(int quantityInStock) {
        if(quantityInStock <= 0) {
            return StockStatus.OutOfStock;
        }
        else if(quantityInStock < 20) {
            return StockStatus.LowStock;
        }
        else{
            return StockStatus.Active;
        }
    }

    private List<Product> checkStatus(List<Product> products){

        List<Product> productList = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            if(products.get(i).isStatus() == true){
                productList.add(products.get(i));
            }
        }
        return productList;
    }
}
