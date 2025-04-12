package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.FeedbackRequest;
import com.example.Inventory_management_backend.dto.response.FeedbackResponse;
import com.example.Inventory_management_backend.model.Feedback;
import com.example.Inventory_management_backend.model.Product;
import com.example.Inventory_management_backend.repository.FeedbackRepository;
import com.example.Inventory_management_backend.repository.ProductRepository;
import com.example.Inventory_management_backend.service.FeedbackService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private FeedbackRepository feedbackRepository;
    private ProductRepository productRepository;

    @Override
    public FeedbackResponse addFeedback(FeedbackRequest feedbackRequest, long productId) {
        Optional<Product> productOptional = productRepository.findById(productId);

        if (productOptional.isEmpty()) {
            throw new RuntimeException("product not found with id " + productId);
        }

        Feedback feedback = new Feedback();

        feedback.setFeedback(feedbackRequest.getFeedback());
        feedback.setProduct(productOptional.get());
        feedback.setStarRating(feedbackRequest.getStarRating());

        feedbackRepository.save(feedback);

        return mapToFeedbackResponse(feedback);
    }

    @Override
    public List<FeedbackResponse> getAllFeedback() {
        List<Feedback> feedbackList = feedbackRepository.findAll();
        return feedbackList.stream().map(this::mapToFeedbackResponse).collect(Collectors.toList());
    }

    private FeedbackResponse mapToFeedbackResponse(Feedback feedback) {

        return FeedbackResponse.builder()
                .id(feedback.getId())
                .feedback(feedback.getFeedback())
                .starRating(feedback.getStarRating())
                .productId(feedback.getProduct().getId())
                .build();
    }
}
