const router = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require("../User");
const JWT = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');



const db = "mongodb://localhost:27017/testdb";
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));



router.post('/signup',
    [
        check('email', 'Provide a valid email').isEmail(),
        check('password', 'Please provide a password with at least 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();
        const token = JWT.sign({ email }, 'secret-key', { expiresIn: 3600000 });

        res.json({ token });
    }
);

router.post('/login',
    [
        check('email', 'Provide a valid email').isEmail(),
        check('password', 'Please provide a password with at least 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        const token = JWT.sign({ email }, 'secret-key', { expiresIn: 3600000 });
        res.json({ token });
    }
);

router.get('/all', async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
router.put('/user/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { email, password } = req.body;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (email) {
            user.email = email;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
router.delete('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.json({ msg: 'User removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports = router;
