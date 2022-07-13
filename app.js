const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();

/**
 * require
 */
const { sequelize } = require('./models');
const passportConfig = require('./passport'); // strategy 객체 만들고 use 등록, serializeUser, deserializeUSer 콜백 등록

/**
 * config
 */
passportConfig();

const app = express();
app.set('port', process.env.PORT || 8002);

app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

/**
 * storage connect
 */
sequelize.sync({force: false})
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

/**
 * middleware
 */
app.use(morgan('dev')); // 로깅
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // request body를 json으로 받아줌? content type이 json인것에 대해서만 적용되나? 일단 다하나?
app.use(express.urlencoded({ extended: false })); // false이면 내장 querystring 모듈 사용, true면 express의 qs 모듈 사용
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(passport.initialize());
app.use(passport.session());

/**
 * use router
 */
app.use('/', require('./routes'));
app.use('/auth', require('./routes/auth'));
app.use('/v1', require('./routes/v1'));

/**
 * error handling
 */
app.use((req, res, next) => {
    const err = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
    err.status = 404; // status 가 error 에 있는 속성은 아닌데 걍 넣은거.
    next(err);
});

app.use((err, req, res, next) => {
    console.error(err.toString());
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

/**
 * run
 */
app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 대기 중`);
});



