
package com.joemart.repo;

import com.joemart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBuyerEmailOrderByCreatedAtDesc(String buyerEmail);
}
