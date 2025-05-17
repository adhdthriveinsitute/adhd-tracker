import bcrypt, { compare } from "bcryptjs";
import mongoose from "mongoose"
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/index.js";
import { USER_TYPES } from "../constants.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true

    },
    accessToken: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    },
    type: {
        type: String,
        enum: USER_TYPES,
        default: 'non-client',
        required: true
    },
    emailVerificationToken: String,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    const user = this;
    return await compare(candidatePassword, user.password);
};

userSchema.methods.generateAccessToken = function () {

    const signOptions = {
        // expiresIn: ACCESS_TOKEN_EXPIRY as string
        expiresIn: "7d"
    };

    return jwt.sign(
        { _id: this._id, email: this.email },
        ACCESS_TOKEN_SECRET,
        signOptions
    );
};


export const User = mongoose.model("User", userSchema);
