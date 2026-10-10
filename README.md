# JOE MART — Spring Boot + Maven + Java 17 + MySQL

This replaces the original Node.js/Laragon implementation with a Java 17 Spring Boot application. The frontend is served by Spring Boot, so it is one website/app and does not need Apache, Node.js, or Laragon. MySQL is still required for persistent data.

## Features
- Roles: ADMIN, BUYER, SELLER; public registration can only create BUYER/SELLER accounts.
- Admin-only product create/update/delete API; buyers and sellers cannot mutate products.
- Search products, responsive product listing, session login/logout.
- Login history records successful login, failed login, logout, timestamp and remote IP; admin-only history endpoint.
- BCrypt password hashing and role-based API protection.
- Admin account is seeded on first start: `admin@joemart.com` / `ChangeMe@123`. **Change this password immediately before deployment.**

## Run locally (Windows)
1. Install JDK 17, Maven, and MySQL Server (MySQL Workbench/HeidiSQL is optional).
2. Start MySQL. Create the database by running `database/joemart.sql` in MySQL, or let the app create it if the MySQL user has permission.
3. Open a terminal in this project folder and set credentials if needed:
   - PowerShell: `$env:DB_USERNAME="root"; $env:DB_PASSWORD="your_mysql_password"`
   - If your database is not local: `$env:DB_URL="jdbc:mysql://HOST:3306/joemart?useSSL=true&serverTimezone=UTC"`
4. Run: `mvn spring-boot:run`
5. Open http://localhost:8080

The default DB settings assume local MySQL root with an empty password. Change environment variables for your setup. Tables are generated/updated automatically by JPA.

## API overview
- `POST /api/auth/register` JSON `{ "name":"Test Buyer", "email":"buyer@example.com", "password":"StrongPass123", "role":"BUYER" }` (role can be BUYER or SELLER; ADMIN is blocked)
- `POST /api/auth/login` JSON `{ "email":"admin@joemart.com", "password":"ChangeMe@123" }`
- `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/products`, `GET /api/products?q=shirt`
- Admin only: `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
- Admin only: `GET /api/admin/login-history`, `GET /api/admin/users`

## Public deployment
A public URL cannot be created from this ZIP alone; deployment requires your hosting account and a reachable MySQL database. Deploy this as a Java 17 Spring Boot service on a host that supports Java apps (or Docker), configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` as environment variables, expose the assigned port (the app reads `PORT`), and use a managed MySQL instance. Use HTTPS, a strong unique admin password, backups, and production CSRF protections before accepting real users. Do not commit DB credentials into source control.

## Important scope note
This is a working starter/demo storefront. Cart persistence, checkout/payment, order workflow, seller analytics, password reset, email verification, audit retention and production-grade deployment configuration are not implemented yet.
