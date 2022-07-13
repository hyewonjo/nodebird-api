const express = require('express');
const { User, Domain } = require('../models');
const { isLoggedIn } = require('./middlewares');
const { v4: uuidV4 } = require('uuid');

const router = express.Router();

/**
 * 메인 페이지
 */
router.get('/', async (req, res, next) => {
    try {
        // 유저 조회
        const user = await User.findOne({
            where: {
                id: req.user && req.user.id || null,
            },
            include: {
                model: Domain,
            },
        });

        // login 페이지 랜더링
        res.render('login', {
            user,
            domains: user && user.Domains,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**
 * 도메인 신규 등록
 * login required
 */
router.post('/domain', isLoggedIn, async (req, res, next) => {
    try {
        await Domain.create({
            UserId: req.user.id,
            host: req.body.host, // form 데이터. express.urlencoded 미들웨어에 의해 읽을수 있게 파싱된 것.
            type: req.body.type,
            clientSecret: uuidV4(),
        });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;