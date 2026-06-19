package com.hospital.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.entity.User;
import com.hospital.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registerUser(
            @Valid @RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/admin/register")
    public User registerAdminOrDoctor(
            @Valid @RequestBody User user) {
        return userService.registerAdminOrDoctor(user);
    }

    @PostMapping("/login")
    public LoginResponse loginUser(
            @RequestBody LoginRequest request) {

        return userService.loginUser(
                request.getEmail(),
                request.getPassword());
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        userService.forgotPassword(email);
    }

    @PostMapping("/verify-code")
    public LoginResponse verifyCode(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");
        return userService.verifyCode(email, code);
    }

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }
}