package com.example.Inventory_management_backend.repository;

import com.example.Inventory_management_backend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
