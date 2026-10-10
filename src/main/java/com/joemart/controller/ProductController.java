package com.joemart.controller;
import com.joemart.model.Product;import com.joemart.repo.ProductRepository;import jakarta.validation.Valid;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/products") public class ProductController {
 private final ProductRepository products;public ProductController(ProductRepository p){products=p;}
 @GetMapping public List<Product> all(@RequestParam(required=false) String q){return q==null||q.isBlank()?products.findAll():products.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(q,q);}
 @GetMapping("/{id}") public Product one(@PathVariable Long id){return products.findById(id).orElseThrow(()->new NoSuchElementException("Product not found"));}
 @PostMapping @PreAuthorize("hasRole('ADMIN')") public Product add(@Valid @RequestBody Product p){p.setId(null);return products.save(p);}
 @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Product update(@PathVariable Long id,@RequestBody Product p){Product old=one(id);old.setName(p.getName());old.setCategory(p.getCategory());old.setPrice(p.getPrice());old.setStock(p.getStock());old.setImage(p.getImage());old.setDescription(p.getDescription());return products.save(old);}
 @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Map<String,String> delete(@PathVariable Long id){products.delete(one(id));return Map.of("message","Product removed");}
}
