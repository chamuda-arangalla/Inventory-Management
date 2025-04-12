package com.example.Inventory_management_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SaleResponse {

    private Long id;
    private LocalDate date;
    private Double totalSale;

}
