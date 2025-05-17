import { Admin } from "../models/admin.model.js";
import { CLIENT_URL, RESEND_API_KEY } from "../config/index.js";
import { Resend } from "resend";
import { AppError } from "../utils/index.js";
import { User } from "../models/user.model.js";
import crypto from "crypto"
import { AdminSettings } from "../models/adminSettings.model.js";


export const generateAccessToken = async (
    userId,
    model,
    userType
) => {
    try {
        const user = await model.findById(userId);

        if (!user) {
            throw new Error(`${userType} not found while generating access token.`);
        }

        const accessToken = user.generateAccessToken();
        await user.save({ validateBeforeSave: false });

        return { accessToken };
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError(
            500,
            error?.message ||
            `Something went wrong on server, while generating access token for ${userType}.`
        );
    }
};


// Sign up a new Admin
export const signupAdminService =
    async (name, email, password) => {
        try {
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                throw new AppError(409, "Admin already exists.");
            }

            const admin = new Admin({
                name,
                email,
                password,
            });

            return await admin.save();
        } catch (error) {
            throw new AppError(500, error?.message || "Failed to create admin.");
        }
    };
//Login admin by verifying credentials

/*
- Login Admin

1. Get admin name and pass from req body.
2. Check if admin exsists - compare email
3. if admin exsists, compare his pass with pass stored in database.
5. if comparison become false, return error.
4. if comparison become successfull, return access token.
5. Send cookies

*/
export const loginAdminService = async (email, password) => {

    const admin = await Admin.findOne({ email });

    if (!admin) {
        throw new AppError(404, "Admin Not Found");
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid Password");
    }

    return admin;
};


// Sign up a new user
export const signupUserService = async (
    name,
    email,
    password,
    role,
    gender,
    dateOfBirth,
    weight,
    type
) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError(409, "User already exists.");
        }

        const adminSettings = await AdminSettings
            .findOne()
            .sort({ createdAt: -1 })
            .lean();

        const requireVerification = adminSettings?.requireEmailVerification;

        let token = null;
        let isEmailVerified = false;

        if (requireVerification) {
            token = crypto.randomBytes(32).toString("hex");
        } else {
            isEmailVerified = true;
        }

        const user = new User({
            name,
            email,
            password,
            role,
            gender,
            dateOfBirth,
            weight,
            type,
            emailVerificationToken: token,
            isEmailVerified
        });

        const savedUser = await user.save();

        if (requireVerification) {
            const verificationUrl = `${CLIENT_URL}/verify-email?token=${token}`;

            const resend = new Resend(RESEND_API_KEY);

            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Verify Your Email',
                html: `<div>
                        <p>Welcome to our platform!</p>
                        <p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>
                       </div>`
            });
        }

        return savedUser;

    } catch (error) {
        throw new AppError(500, error.message || "Failed to create user.");
    }
};



export const verifyEmailService = async (token) => {
    try {
        if (!token) {
            throw new AppError(400, "Token is missing.");
        }

        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            throw new AppError(400, "Invalid or expired token.");
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;

        await user.save({ validateBeforeSave: false });

        return {
            success: true,
            message: "Email verified successfully.",
        };
    } catch (error) {
        throw error instanceof AppError
            ? error
            : new AppError(500, error.message || "Failed to verify email.");
    }
};



export const resendEmailVerificationService = async (email) => {
    try {
        if (!email) {
            throw new AppError(400, "Email is required.");
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw new AppError(404, "User not found.");
        }

        if (user.isEmailVerified) {
            throw new AppError(400, "Email is already verified.");
        }

        const newToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = newToken;
        await user.save({ validateBeforeSave: false });

        const verificationUrl = `${CLIENT_URL}/verify-email?token=${newToken}`;

        const resend = new Resend(RESEND_API_KEY);

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: user.email,
            subject: "Verify your email",
            html: `
                <div>
                    <p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>
                </div>
            `
        });

        return {
            success: true,
            message: "Verification email resent successfully."
        };

    } catch (error) {
        throw error instanceof AppError
            ? error
            : new AppError(500, error.message || "Failed to resend verification email.");
    }
};




//Login user by verifying credentials

/*
- Login User

1. Get username and pass from req body.
2. Check if user exsists - compare email
3. if user exsists, compare his pass with pass stored in database.
5. if comparison become false, return error.
4. if comparison become successfull, return access and refresh token.
5. Send cookies

*/
export const loginUserService = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(404, "User Not Found");
    }

    if (!user.isEmailVerified) {
        throw new AppError(403, "Please verify your email first.");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid Password");
    }

    return user;
};
