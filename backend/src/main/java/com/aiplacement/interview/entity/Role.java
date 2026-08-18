package com.aiplacement.interview.entity;

// Kept as a plain enum (not a table) for the MVP — simpler and enough for
// @PreAuthorize checks. If you later need dynamic, admin-editable roles,
// promote this to its own entity + a join table with User.
public enum Role {
    STUDENT,
    FACULTY,
    PLACEMENT_CELL,
    ADMIN
}
