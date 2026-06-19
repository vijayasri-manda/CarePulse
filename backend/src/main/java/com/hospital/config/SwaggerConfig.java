package com.hospital.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hospitalOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("Hospital Management System API")
                        .version("1.0")
                        .description(
                                "Advanced Hospital Management System APIs")
                        .contact(new Contact()
                                .name("Your Name")
                                .email("your@email.com")));
    }
}