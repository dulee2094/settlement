const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve frontend files

// Database Setup (SQLite for simplicity)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// Models
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }, // In production, hash this!
    role: { type: DataTypes.ENUM('offender', 'victim'), allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false }
});

const Case = sequelize.define('Case', {
    caseNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending, negotiating, settled
    offenderId: { type: DataTypes.INTEGER },
    victimId: { type: DataTypes.INTEGER }, // Can be null initially
    victimPhone: { type: DataTypes.STRING } // Encrypted in real app
});

const Proposal = sequelize.define('Proposal', {
    caseId: { type: DataTypes.INTEGER, allowNull: false },
    proposerId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT }
});

// Routes

// 1. Sign Up
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        const user = await User.create({ email, password, role, name });
        res.json({ success: true, userId: user.id, name: user.name });
    } catch (error) {
        res.status(400).json({ success: false, error: 'User already exists or invalid data' });
    }
});

// 2. Login (Mock)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, password } });
    if (user) {
        res.json({ success: true, userId: user.id, name: user.name, role: user.role });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// 3. Create/Link Case
app.post('/api/case/link', async (req, res) => {
    const { userId, caseNumber, role } = req.body;

    let caseData = await Case.findOne({ where: { caseNumber } });

    if (!caseData) {
        // Create new case if not exists
        if (role === 'offender') {
            caseData = await Case.create({ caseNumber, offenderId: userId });
        } else {
            return res.status(404).json({ success: false, error: 'Case not found. Offender must register first.' });
        }
    } else {
        // Link to existing case
        if (role === 'victim') {
            caseData.victimId = userId;
            await caseData.save();
        }
    }

    res.json({ success: true, caseId: caseData.id });
});

// 4. Send Invite (Offender -> Victim)
app.post('/api/case/invite', async (req, res) => {
    const { caseNumber, victimPhone } = req.body;
    const caseData = await Case.findOne({ where: { caseNumber } });

    if (caseData) {
        caseData.victimPhone = victimPhone;
        await caseData.save();
        // Here we would integrate w/ Twilio or Aligo for real SMS
        console.log(`[SMS MOCK] To: ${victimPhone}, Msg: Case ${caseNumber} settlement requested.`);
        res.json({ success: true, message: 'Invitation sent' });
    } else {
        res.status(404).json({ success: false });
    }
});

// 5. Blind Proposal
app.post('/api/proposal', async (req, res) => {
    const { caseId, userId, amount } = req.body;
    await Proposal.create({ caseId, proposerId: userId, amount });

    // Check gap logic
    const proposals = await Proposal.findAll({ where: { caseId }, limit: 2, order: [['createdAt', 'DESC']] });

    let gapStatus = 'waiting';
    let gapData = {};

    if (proposals.length >= 2) {
        // Simplification: assumes last 2 are from diff users
        const p1 = proposals[0].amount;
        const p2 = proposals[1].amount;
        const diff = Math.abs(p1 - p2);

        gapStatus = 'analyzed';
        gapData = { diff };
    }

    res.json({ success: true, status: gapStatus, data: gapData });
});

// Initialize & Start
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
