import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { withAdminAuth } from "@/lib/auth";

// GET - Retrieve a specific user by ID (admin only)
export const GET = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await connectToDatabase();

      const userId = params.id;

      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 },
        );
      }

      // Find user
      const user = await User.findById(userId).select("-passwordHash");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 },
      );
    }
  },
);

// PUT - Update a specific user (admin only)
export const PUT = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await connectToDatabase();

      const userId = params.id;

      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 },
        );
      }

      // Get user data
      const body = await request.json();
      const { email, firstName, lastName, role, isActive, languagePreference } =
        body;

      // Find user
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if this is changing an admin to a user role
      if (role && user.role === "admin" && role === "user") {
        // Check if this is the only admin account
        const adminCount = await User.countDocuments({ role: "admin" });

        if (adminCount <= 1) {
          return NextResponse.json(
            {
              error:
                "Cannot demote the last admin account. Create another admin first.",
            },
            { status: 400 },
          );
        }
      }

      // Check if deactivating an admin
      if (isActive === false && user.role === "admin") {
        // Check if this is the only active admin account
        const activeAdminCount = await User.countDocuments({
          role: "admin",
          isActive: true,
        });

        if (activeAdminCount <= 1) {
          return NextResponse.json(
            {
              error:
                "Cannot deactivate the last active admin account. Activate another admin first.",
            },
            { status: 400 },
          );
        }
      }

      // Update user fields
      if (email) user.email = email;
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (role && ["user", "admin"].includes(role)) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (languagePreference && ["th", "en"].includes(languagePreference)) {
        user.languagePreference = languagePreference;
      }

      // Handle password update if provided
      if (body.password) {
        const bcrypt = require("bcrypt");

        user.passwordHash = await bcrypt.hash(body.password, 10);
      }

      // Save updated user
      await user.save();

      // Return updated user without password hash
      const updatedUser = user.toObject();

      delete updatedUser.passwordHash;

      return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }
  },
);

// DELETE - Delete a specific user (admin only)
export const DELETE = withAdminAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      await connectToDatabase();

      const userId = params.id;

      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 },
        );
      }

      // Find user first
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if deleting an admin account
      if (user.role === "admin") {
        // Check if this is the only admin account
        const adminCount = await User.countDocuments({ role: "admin" });

        if (adminCount <= 1) {
          return NextResponse.json(
            {
              error:
                "Cannot delete the last admin account. Create another admin first.",
            },
            { status: 400 },
          );
        }
      }

      // Delete the user
      const deletedUser = await User.findByIdAndDelete(userId);

      return NextResponse.json({
        message: "User deleted successfully",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 },
      );
    }
  },
);
