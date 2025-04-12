package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.model.Inventory;
import com.example.Inventory_management_backend.repository.InventoryRepository;
import com.example.Inventory_management_backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    InventoryRepository inventoryRepository;

}
