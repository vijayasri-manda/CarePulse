package com.hospital.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospital.dto.LoginResponse;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtUtil;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public User registerUser(User user) {

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("PATIENT");
        } else {
            user.setRole(user.getRole().trim().toUpperCase());
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public User registerAdminOrDoctor(User user) {

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public LoginResponse loginUser(
            String username,
            String password) {

        User user =
                userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Invalid Email"));

        boolean matched =
                passwordEncoder.matches(
                        password,
                        user.getPassword());

        if (!matched) {

            throw new ResourceNotFoundException(
                    "Invalid Password");
        }

        String token =
                jwtUtil.generateToken(
                        user.getUsername(),
                        user.getRole());

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole());
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + email));

        // Generate 6-digit random code
        String code = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setVerificationCode(code);
        userRepository.save(user);

        // Try sending email
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("CarePulse Portal Verification Code");
                message.setText("Hello,\n\nYour verification code to sign in is: " + code + "\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nCarePulse Support Team");
                mailSender.send(message);
                System.out.println("[EMAIL SUCCESS] Sent verification code to " + email);
            } else {
                System.out.println("[EMAIL WARNING] JavaMailSender not configured. Email not sent.");
            }
        } catch (Exception e) {
            System.err.println("[EMAIL ERROR] Failed to send email to " + email + ". Reason: " + e.getMessage());
        }

        // Always print to backend console as fallback
        System.out.println("\n==================================================");
        System.out.println("[EMAIL MOCK] Verification code for " + email + " is: " + code);
        System.out.println("==================================================\n");
    }

    @Override
    public LoginResponse verifyCode(String email, String code) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + email));

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // Clear code on successful verification
        user.setVerificationCode(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole());

        return new LoginResponse(
                token,
                user.getUsername(),
                user.getRole());
    }

    @Override
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id " + id));
    }
}