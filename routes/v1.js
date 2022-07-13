const express = require('express');
const { Domain, User } = require('../models');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middlewares');

const router = express.Router();

/**
 * client secret 으로 jwt 토큰 발급
 */
router.post('/token', async (req, res) => {
    // secret 이 유효한지 검사
    try {
        const { clientSecret } = req.body;
        const domain = await Domain.findOne({
            where: {
                clientSecret: clientSecret,
            },
            include: {
                model: User,
                attributes: ['nick', 'id'],
            },
        });

        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
            });
        }

        // token 발급
        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: '1m',
            issuer: 'nodebird',
        });

        res.json({
            code: 200,
            message: '토큰이 발급되었습니다',
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
});

module.exports = router;