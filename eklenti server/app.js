const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 500000 }));
const { mongoose } = require('./db/mongoose');
const birthday_info_user_schema = require('./db/models/user');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/api_birthday_reminder/birthday_info_user', async (req, res) => {

    const { user_email, first_name, last_name, birthday_day, birthday_month, birthday_year } = req.body;
    const user = {
        first_name,
        last_name,
        birthday_day,
        birthday_month,
        birthday_year
    };

    try {
        let birthdayInfo = await birthday_info_user_schema.findOne({ user_email });

        if (birthdayInfo) {
            birthdayInfo.users.push(user);
        } else {
            birthdayInfo = new birthday_info_user_schema({
                user_email,
                users: [user]
            });
        }

        let newkullanici = await birthdayInfo.save();
        res.json(newkullanici);
    } catch (err) {
        console.log('Doğum günü tarihi kaydederken hata oluştu:', err);
    }
});

app.get('/api_birthday_reminder/birthday_info_user/:user_email', async (req, res) => {
    try {
        const birthdayInfo = await birthday_info_user_schema.findOne({ user_email: req.params.user_email });
        if (!birthdayInfo) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.json(birthdayInfo.users);
    } catch (err) {
        console.log('Doğum günü bilgilerini getirirken hata oluştu:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

app.delete('/api_birthday_reminder/birthday_info_user/:user_email/:first_name/:last_name', async (req, res) => {
    try {
        const birthdayInfo = await birthday_info_user_schema.findOne({ user_email: req.params.user_email });
        if (!birthdayInfo) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        const userIndex = birthdayInfo.users.findIndex(user => user.first_name === req.params.first_name && user.last_name === req.params.last_name);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        birthdayInfo.users.splice(userIndex, 1);
        await birthdayInfo.save();
        res.json(birthdayInfo.users);
    } catch (err) {
        console.log('Doğum günü bilgisini silerken hata oluştu:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});


app.listen(3000, () => {
    console.log('Listening on port 3000');
});
