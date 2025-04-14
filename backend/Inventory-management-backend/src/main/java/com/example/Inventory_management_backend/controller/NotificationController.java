package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@AllArgsConstructor
@CrossOrigin("*")
public class NotificationController {

    private NotificationService notificationService;

    @GetMapping("/")
    public ResponseEntity<List<String>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getExpiringProducts());
    }
}
