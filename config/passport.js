const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

// Giả lập cấu hình passport để khỏi crash khi chưa có KEY
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET";
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "YOUR_FACEBOOK_APP_SECRET";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.getById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Cấu hình Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem user có tồn tại bằng googleId không
        let user = await User.schema.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        // Kiểm tra xem email đã tồn tại trong hệ thống chưa
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.schema.findOne({ email });
          if (user) {
            // Liên kết googleId vào tài khoản cũ
            user.googleId = profile.id;
            if (!user.avatar || user.avatar === '/images/default-avatar.svg') {
                user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // Tạo tài khoản mới
        const newUser = await User.schema.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email || `${profile.id}@google.com`, // Fallback nếu không có email
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '/images/default-avatar.svg',
          role: "customer",
          isActive: true
        });
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Cấu hình Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'emails', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.schema.findOne({ facebookId: profile.id });
        if (user) {
          return done(null, user);
        }

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.schema.findOne({ email });
          if (user) {
            user.facebookId = profile.id;
            if (!user.avatar || user.avatar === '/images/default-avatar.svg') {
                user.avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '/images/default-avatar.svg';
            }
            await user.save();
            return done(null, user);
          }
        }

        const newUser = await User.schema.create({
          facebookId: profile.id,
          name: profile.displayName,
          email: email || `${profile.id}@facebook.com`,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '/images/default-avatar.svg',
          role: "customer",
          isActive: true
        });
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
