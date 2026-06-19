package com.hospital.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictingAppointmentException extends RuntimeException {
    public ConflictingAppointmentException(String message) {
        super(message);
    }
}
