package com.joemart;
import com.joemart.model.*;import com.joemart.repo.*;import org.springframework.boot.*;import org.springframework.boot.autoconfigure.SpringBootApplication;import org.springframework.context.annotation.Bean;import org.springframework.security.crypto.password.PasswordEncoder;
@SpringBootApplication
public class JoeMartApplication {
 public static void main(String[] args){SpringApplication.run(JoeMartApplication.class,args);}
 @Bean CommandLineRunner seed(UserRepository users,ProductRepository products,PasswordEncoder encoder){return args->{if(!users.existsByEmail("admin@joemart.com")){User u=new User();u.setName("Joe Mart Admin");u.setEmail("admin@joemart.com");u.setPassword(encoder.encode("ChangeMe@123"));u.setRole(Role.ADMIN);users.save(u);}if(products.count()==0){String[][] p={{"Cotton T-Shirt","Fashion","399","50","👕"},{"Bluetooth Headphones","Electronics","1299","30","🎧"},{"Coffee Mug","Home","249","40","☕"},{"Fresh Fruits","Groceries","349","60","🍎"}};for(String[] x:p){Product z=new Product();z.setName(x[0]);z.setCategory(x[1]);z.setPrice(new java.math.BigDecimal(x[2]));z.setStock(Integer.parseInt(x[3]));z.setImage(x[4]);z.setDescription(x[0]);products.save(z);}}};}
}
