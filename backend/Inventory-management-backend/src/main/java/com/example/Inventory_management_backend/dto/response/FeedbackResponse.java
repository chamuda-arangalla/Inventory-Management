package com.example.Inventory_management_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeedbackResponse {

    private Long id;
    private String feedback;
    private int starRating;
    private long productId;
}
