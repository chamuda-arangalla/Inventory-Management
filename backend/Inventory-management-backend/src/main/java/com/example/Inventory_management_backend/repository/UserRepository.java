package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
