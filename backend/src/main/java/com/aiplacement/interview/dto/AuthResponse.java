package com.aiplacement.interview.dto;

// Never return the User entity directly (would leak passwordHash) — this is
// exactly why DTOs exist even for something this simple.
public record AuthResponse(String token, String email, String role) {}
