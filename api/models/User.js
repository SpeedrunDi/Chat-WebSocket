const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {nanoid} = require('nanoid');
const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

const validateUnique = async value => {
  const user = await User.findOne({username: value});

  if (user) return false;
};

const validatePassword = value => {
  const pattern = /[\w]{4,30}/;

  if (!pattern.test(value)) return false;
};

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: [
            {validator: validateUnique, message: 'This user is already registered'}
        ]
    },
    password: {
        type: String,
        required: true,
        validate: [
            {validator: validatePassword, message: 'Your password must be 4 characters'}
        ]
    },
    token: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['admin', 'user']
    },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(this.password, salt);

    this.password = hash;
    next();
});

UserSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    }
});

UserSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
}

UserSchema.methods.generateToken = function () {
    this.token = nanoid();
}

const User = mongoose.model('User', UserSchema);

module.exports = User;