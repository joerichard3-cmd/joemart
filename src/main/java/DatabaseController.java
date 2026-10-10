
package com.joemart;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/database-check")
    public Map<String, Object> checkDatabase() {
        String database = jdbcTemplate.queryForObject(
            "SELECT DATABASE()", String.class
        );

        Integer testRows = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM test_connection", Integer.class
        );

        return Map.of(
            "status", "connected",
            "database", database,
            "test_connection_rows", testRows
        );
    }
}
