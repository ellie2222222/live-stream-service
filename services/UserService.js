const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose');
const DatabaseTransaction = require('../repositories/DatabaseTransaction');
const UserRepository = require('../repositories/UserRepository');

// Sign up a new user
const signup = async (username, email, password) => {
    try {
        const connection = new DatabaseTransaction();

        if (!validator.isEmail(email)) {
            throw new Error('Invalid email address');
        }

        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            throw new Error('Password is not strong enough');
        }

        const existingUser = await connection.userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('Email is already in use');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await connection.userRepository.createUser({
            username,
            email,
            password: hashedPassword
        }, session);

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Log in a user
const login = async (email, password) => {
    try {
        const connection = new DatabaseTransaction();

        if (!validator.isEmail(email)) {
            throw new Error('Invalid email address');
        }

        const user = await connection.userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Incorrect password');
        }

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

const findUser = async (userId) => {
    try {
        const connection = new DatabaseTransaction();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await connection.userRepository.findUserById(userId);

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

const updateUserProfile = async (userId, updateData) => {
    try {
        const connection = new DatabaseTransaction();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await connection.userRepository.updateUser(userId, updateData);

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

const deactivateUser = async (userId) => {
    try {
        const connection = new DatabaseTransaction();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await connection.userRepository.deactivateUser(userId);

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    login,
    signup,
    findUser,
    updateUserProfile,
    deactivateUser,
};
