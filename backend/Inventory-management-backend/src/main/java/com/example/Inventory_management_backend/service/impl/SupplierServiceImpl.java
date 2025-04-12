//package com.example.Inventory_management_backend.service.impl;
//
//import com.example.Inventory_management_backend.dto.request.SupplierRequest;
//import com.example.Inventory_management_backend.dto.response.SupplierResponse;
//import com.example.Inventory_management_backend.exception.AllReadyExistsException;
//import com.example.Inventory_management_backend.exception.NotFoundException;
//import com.example.Inventory_management_backend.model.Supplier;
//import com.example.Inventory_management_backend.repository.SupplierRepository;
//import com.example.Inventory_management_backend.service.SupplierService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class SupplierServiceImpl implements SupplierService {
//
//    @Autowired
//    private SupplierRepository supplierRepository;
//
//    @Override
//    public SupplierResponse createSupplier(SupplierRequest supplierRequest) throws AllReadyExistsException {
//        // Validate supplier email exist
//        validateSupplierRequest(supplierRequest);
//
//        Supplier supplier = new Supplier();
//        // Set supplier details
//        setSupplierDetails(supplierRequest, supplier);
//
//        supplierRepository.save(supplier);
//
//        return mapToSupplierResponse(supplier);
//    }
//
//    @Override
//    public List<SupplierResponse> getAllSuppliers(){
//        List<Supplier> suppliers = supplierRepository.findAll();
//        return suppliers.stream().map(this::mapToSupplierResponse).collect(Collectors.toList());
//    }
//
//    @Override
//    public SupplierResponse updateSupplier(long supplierId, SupplierRequest supplierRequest) throws NotFoundException, AllReadyExistsException {
//        Supplier existingSupplier = supplierRepository.findById(supplierId)
//                .orElseThrow(() -> new NotFoundException("Supplier not found with id " + supplierId));
//        // Validate supplier email exist
//        validateSupplierRequest(supplierRequest);
//        // Set supplier details
//        setSupplierDetails(supplierRequest, existingSupplier);
//
//        supplierRepository.save(existingSupplier);
//
//        return mapToSupplierResponse(existingSupplier);
//    }
//
//    @Override
//    public SupplierResponse getSupplier(long supplierId) throws NotFoundException {
//        Supplier supplier = supplierRepository.findById(supplierId)
//                .orElseThrow(() -> new NotFoundException("Supplier not found with id " + supplierId));
//
//        return mapToSupplierResponse(supplier);
//    }
//
//    @Override
//    public void deleteSupplier(long supplierId) throws NotFoundException {
//        Supplier supplier = supplierRepository.findById(supplierId)
//                .orElseThrow(() -> new NotFoundException("Supplier not found with id " + supplierId));
//
//        supplierRepository.delete(supplier);
//    }
//
//    private void validateSupplierRequest(SupplierRequest supplierRequest) throws AllReadyExistsException {
//        Supplier supplierExist = supplierRepository.findByEmail(supplierRequest.getEmail());
//        if (supplierExist != null) {
//            throw new AllReadyExistsException("Supplier email already exists");
//        }
//    }
//
//    private void setSupplierDetails(SupplierRequest supplierRequest, Supplier supplier) {
//        supplier.setName(supplierRequest.getName());
////        supplier.setAddress(supplierRequest.getAddress());
//        supplier.setEmail(supplierRequest.getEmail());
//        supplier.setPhone(supplierRequest.getPhone());
//    }
//
//    private SupplierResponse mapToSupplierResponse(Supplier supplier) {
//        return SupplierResponse.builder()
//                .id(supplier.getId())
//                .name(supplier.getName())
////                .address(supplier.getAddress())
//                .email(supplier.getEmail())
//                .phone(supplier.getPhone())
//                .build();
//    }
//}
