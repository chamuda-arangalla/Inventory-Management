package com.example.Inventory_management_backend.service.impl;

import com.example.Inventory_management_backend.dto.request.SaleRequest;
import com.example.Inventory_management_backend.dto.response.SaleResponse;
import com.example.Inventory_management_backend.model.Order;
import com.example.Inventory_management_backend.model.OrderStatus;
import com.example.Inventory_management_backend.model.Sale;
import com.example.Inventory_management_backend.repository.OrderRepository;
import com.example.Inventory_management_backend.repository.SaleRepository;
import com.example.Inventory_management_backend.service.SaleService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SaleServiceImpl implements SaleService {

    private OrderRepository orderRepository;
    private SaleRepository saleRepository;

    @Override
    public SaleResponse createSale(SaleRequest saleRequest) {
        Optional<Order> optionalOrder = orderRepository.findById(saleRequest.getOrderId());

        if (!optionalOrder.isPresent()) {
            throw new RuntimeException("Order not found with ID: " + saleRequest.getOrderId());
        }


        Order order = optionalOrder.get();

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("this order is confirmed");
        }

        order.setOrderStatus(OrderStatus.CONFIRM);
        Order confirmOrder = orderRepository.save(order);

        List<Order> confirmOrders = orderRepository.findAllByConfirmOrders();
        Double totalSale = 0.0;
        for(Order o : confirmOrders) {
            totalSale += o.getTotalAmount();
        }

        Sale sale = new Sale();
        sale.setDate(LocalDate.now());
        sale.setTotalSale(totalSale);
        Sale savedSale = saleRepository.save(sale);

        return SaleResponse.builder()
                .id(savedSale.getId())
                .date(savedSale.getDate())
                .totalSale(savedSale.getTotalSale())
                .build();
    }

    @Override
    public String pointOfSales() {
        LocalDate date = LocalDate.now();
        List<Sale> allSales = saleRepository.findAllByDate(date);

        Double pointOfSales = 0.0;

        for (Sale sale : allSales){
            pointOfSales += sale.getTotalSale();
        }
        return "Point of the Sales of " + date + " is " + pointOfSales;
    }

    @Override
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
}
