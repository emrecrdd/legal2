import { authRepository } from './auth.repository.js';
import { generateTokens, verifyToken } from '../../utils/jwt.js';
import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import crypto from 'crypto';

export const authService = {
  async register(userData) {
    // Check if user exists
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await authRepository.create(userData);
    return user;
  },

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    await authRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async logout(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    await authRepository.invalidateRefreshToken(refreshToken);
  },

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Find user with this refresh token
    const user = await authRepository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token
    await authRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens
    await authRepository.invalidateAllRefreshTokens(userId);
  },

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await authRepository.savePasswordResetToken(user.id, resetToken, resetExpires);

    // TODO: Send email with reset link
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    return { resetToken };
  },

  async resetPassword(token, newPassword) {
    const user = await authRepository.findByPasswordResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (user.password_reset_expires < new Date()) {
      throw new Error('Reset token has expired');
    }

    user.password = newPassword;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    // Invalidate all refresh tokens
    await authRepository.invalidateAllRefreshTokens(user.id);
  },
};