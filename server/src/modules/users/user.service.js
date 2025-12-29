const User = require('./user.model')
const bcrypt = require('bcryptjs')


exports.createUser = async (data) => {
    const { name, email, password, role } = data

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });
    
}


exports.getUsers = async () => {
    return await User.find().select('-password');
};


exports.updateUserStatus = async (id, status) => {
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        throw new Error('Invalid status');
    }

    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    user.status = status;
    await user.save();
    return user;
};
