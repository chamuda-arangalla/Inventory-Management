package com.example.Inventory_management_backend.controller;

import com.example.Inventory_management_backend.dto.request.FeedbackRequest;
import com.example.Inventory_management_backend.dto.response.FeedbackResponse;
import com.example.Inventory_management_backend.model.Feedback;
import com.example.Inventory_management_backend.service.FeedbackService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@AllArgsConstructor
@CrossOrigin("*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/save/{productId}")
    public ResponseEntity<FeedbackResponse> save(@PathVariable Long productId, @RequestBody FeedbackRequest feedback) {
        return ResponseEntity.ok(feedbackService.addFeedback(feedback, productId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
