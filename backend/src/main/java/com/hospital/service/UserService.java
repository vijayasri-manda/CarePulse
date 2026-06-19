package com.hospital.service;

import java.util.List;

import com.hospital.dto.LoginResponse;
import com.hospital.entity.User;

public interface UserService {

    User registerUser(User user);

    User registerAdminOrDoctor(User user);

    LoginResponse loginUser(String username,
                            String password);

    void forgotPassword(String email);

    LoginResponse verifyCode(String email, String code);

    List<User> getAllUsers();

    User getUserById(Long id);
}