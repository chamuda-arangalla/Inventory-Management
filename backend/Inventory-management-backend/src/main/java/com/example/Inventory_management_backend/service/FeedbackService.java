package com.example.Inventory_management_backend.service;

import com.example.Inventory_management_backend.dto.request.FeedbackRequest;
import com.example.Inventory_management_backend.dto.response.FeedbackResponse;

import java.util.List;

public interface FeedbackService {

    FeedbackResponse addFeedback(FeedbackRequest feedbackRequest, long productId);
    List<FeedbackResponse> getAllFeedback();
}
