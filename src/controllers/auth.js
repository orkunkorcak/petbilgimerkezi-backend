import { registerUser } from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import { ONE_MONTH } from '../constants/index.js';
import { logoutUser } from '../services/auth.js';
import { refreshUsersSession } from '../services/auth.js';
import { requestResetToken } from '../services/auth.js';
import { resetPassword } from '../services/auth.js';
import { UsersCollection } from '../db/models/user.js';

const isProduction = process.env.NODE_ENV === 'production';

// Cookie ayarlarını merkezi bir fonksiyona taşıdık
const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // Render’da HTTPS zorunlu
  sameSite: isProduction ? 'None' : 'Lax', // Cross-origin için gerekli
  expires: new Date(Date.now() + ONE_MONTH),
};

// Yeni session cookie’lerini ayarlamak için yardımcı fonksiyon
const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    ...cookieOptions,
    path: '/api/auth/refresh', // refresh endpoint’ine özel cookie
  });

  res.cookie('sessionId', session._id, {
    ...cookieOptions,
  });
};

// 🧩 REGISTER
export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

// 🧩 LOGIN
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  const user = await UsersCollection.findOne({ email: req.body.email });

  // Cookie’leri güvenli şekilde ayarla
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in user!',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken: session.accessToken,
    },
  });
};

// 🧩 LOGOUT
export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  // Cookie’leri güvenli şekilde temizle
  res.clearCookie('sessionId', {
    ...cookieOptions,
  });
  res.clearCookie('refreshToken', {
    ...cookieOptions,
    path: '/api/auth/refresh',
  });

  res.status(204).send();
};

// 🧩 REFRESH SESSION
export const refreshUserSessionController = async (req, res) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized - missing cookies',
        data: {},
      });
    }

    const session = await refreshUsersSession({ sessionId, refreshToken });

    // Yeni cookie’leri ayarla
    setupSession(res, session);

    res.json({
      status: 200,
      message: 'Successfully refreshed session!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh session error:', error.message);
    res.status(401).json({
      status: 401,
      message: 'Unauthorized - invalid session or refresh token',
      data: {},
    });
  }
};

// 🧩 PASSWORD RESET FLOW
export const sendResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};
