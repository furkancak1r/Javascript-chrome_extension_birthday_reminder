const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 500000 }));
const { mongoose } = require('./db/mongoose');
const birthday_info_user_schema = require('./db/models/user');
const nodeoutlook = require('nodejs-nodemailer-outlook');
const dotenv = require('dotenv');
dotenv.config({ path: './emailinfo.env' });




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
            return res.status(404).json({ message: 'Kullanıcı bulunamadı. 1' });
            //  birthdayInfo = new birthday_info_user_schema({
            //    user_email
            //});
            //let newkullanici = await birthdayInfo.save();
            //res.json(newkullanici);
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
            return res.status(404).json({ message: 'Kullanıcı bulunamadı. 2' });
        }
        const userIndex = birthdayInfo.users.findIndex(user => user.first_name === req.params.first_name && user.last_name === req.params.last_name);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı. 3' });
        }
        birthdayInfo.users.splice(userIndex, 1);
        await birthdayInfo.save();
        res.json(birthdayInfo.users);
    } catch (err) {
        console.log('Doğum günü bilgisini silerken hata oluştu:', err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});


async function getBirthdays() {
    const today = new Date();
    const users = await birthday_info_user_schema.find({});
    const birthdayList = [];

    users.forEach(user => {
        user.users.forEach(birthdayPerson => {
            const { birthday_day, birthday_month, birthday_year } = birthdayPerson;
            const birthday = new Date(`${birthday_year}-${birthday_month}-${birthday_day}T00:00:00.000Z`);
            if (birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()) {
                // Yaşı hesapla
                let age = today.getFullYear() - birthday.getFullYear();
                if (today.getMonth() < birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) {
                    age--;
                }
                // Yaşı listeye ekle
                birthdayList.push({
                    email: user.user_email,
                    firstName: birthdayPerson.first_name,
                    lastName: birthdayPerson.last_name,
                    age: age,
                    birthday_day: parseInt(birthdayPerson.birthday_day),
                    birthday_month: parseInt(birthdayPerson.birthday_month),
                    birthday_year: parseInt(birthdayPerson.birthday_year)
                });
            }
        });
    });

    console.log("birthdayList", birthdayList);
    return birthdayList;
}

async function sendBirthdayEmails(birthdayList) {
    for (const birthdayPerson of birthdayList) {
        const { email, firstName, lastName, age } = birthdayPerson;
        //const html = `<p>Merhaba ${firstName} ${lastName},</p><p>Doğum gününüzü kutluyoruz! Umarız harika bir gün geçirirsiniz.</p>`;
        const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>New message</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style type="text/css">
      #outlook a {
      padding:0;
      }
      .ExternalClass {
      width:100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
      line-height:100%;
      }
      .es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
      }
      .es-desk-hidden {
      display:none;
      float:left;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120%!important } h1 { font-size:30px!important; text-align:center } h2 { font-size:26px!important; text-align:center } h3 { font-size:20px!important; text-align:center } h1 a { text-align:center } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } h2 a { text-align:center } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } h3 a { text-align:center } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-width:10px 0px 10px 0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
      </style>
      </head>
      <body style="width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:tahoma, verdana, segoe, sans-serif;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#E8E8E4"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#e8e8e4"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#E8E8E4">
      <tr style="border-collapse:collapse">
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr style="border-collapse:collapse">
      <td class="es-adaptive" align="center" style="padding:0;Margin:0">
      <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center">
      <tr style="border-collapse:collapse">
      <td align="left" style="padding:10px;Margin:0">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr style="border-collapse:collapse">
      <td align="center" style="padding:0;Margin:0">
      <table class="es-header-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
      <tr style="border-collapse:collapse">
      <td align="left" style="Margin:0;padding-top:10px;padding-left:15px;padding-right:15px;padding-bottom:20px">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td valign="top" align="center" style="padding:0;Margin:0;width:570px">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td align="center" style="padding:0;Margin:0;display:none"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr style="border-collapse:collapse">
      <td class="es-adaptive" align="center" style="padding:0;Margin:0">
      <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fafcfb;width:600px" cellspacing="0" cellpadding="0" bgcolor="#fafcfb" align="center">
      <tr style="border-collapse:collapse">
      <td align="left" style="padding:0;Margin:0;padding-left:10px;padding-right:10px">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td style="padding:0;Margin:0;position:relative" align="center"><a target="_blank"  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#02951E;font-size:14px"><img class="adapt-img" src="https://cdn.pixabay.com/photo/2016/08/30/09/58/cake-1630185_1280.jpg" alt title width="580" style="padding-top: 10px; display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic "></a></td>
      </tr>
      <tr style="border-collapse:collapse">
      <td class="es-m-txt-c" align="center" style="padding:0;Margin:0;padding-left:30px;padding-right:30px;padding-top:40px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#666666">Birthday Reminder,</h3></td>
      </tr>
      <tr style="border-collapse:collapse">
      <td class="es-m-txt-c" esdev-links-color="#ffffff" align="center" style="Margin:0;padding-top:5px;padding-bottom:15px;padding-left:30px;padding-right:30px"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#50b948">Happy Birthday to ${firstName} ${lastName} ! ${age} years old!</h2></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      <tr style="border-collapse:collapse">
      <td align="left" style="padding:0;Margin:0;padding-left:30px;padding-right:30px;padding-bottom:40px">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td valign="top" align="center" style="padding:0;Margin:0;width:540px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td class="es-m-txt-c" align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;line-height:21px;color:#999999;font-size:14px">Here is a personal birthday message for you to send the person;</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:tahoma, verdana, segoe, sans-serif;line-height:21px;color:#999999;font-size:14px">Happy birthday, ${firstName}! Today is a day to celebrate all the wonderful things that make you special. On your special day, I wish you all the happiness and joy that life has to offer. May your dreams and aspirations come true, and may you always find reasons to smile and laugh.

      As you celebrate another year of life, I hope you take a moment to reflect on all the amazing things you have accomplished so far. Your hard work, dedication, and kindness have not gone unnoticed, and you are truly appreciated by those around you.
      
      I am honored to have the opportunity to send you this message on your birthday, and I hope you have a fantastic day filled with love, laughter, and celebration. Once again, happy birthday and best wishes for the year ahead!</p></td>
      </tr>
      <tr style="border-collapse:collapse">
      <td class="es-m-txt-c" align="center" style="padding:0;Margin:0;padding-top:20px"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr style="border-collapse:collapse">
      <td align="center" style="padding:0;Margin:0">
      <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
      <tr style="border-collapse:collapse">
      <td align="left" style="padding:0;Margin:0">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td align="center" style="padding:0;Margin:0;font-size:0">
      <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td style="padding:0;Margin:0;border-bottom:4px solid #cccccc;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr style="border-collapse:collapse">
      <td align="center" style="padding:0;Margin:0">
      <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center">
      <tr style="border-collapse:collapse">
      <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr style="border-collapse:collapse">
      <td align="center" style="padding:0;Margin:0;display:none"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      </div>
      </body>
      </html>`;
        const subject = 'Birthday Reminder!';

        try {
            const email = process.env.EMAIL_USERNAME;
            const password = process.env.EMAIL_PASSWORD;
            console.log(username, password)
            await nodeoutlook.sendEmail({
                auth: {
                    user: email,
                    pass: password
                },
                from: email,
                to: email,
                subject: subject,
                html: html
            });
        } catch (err) {
            console.error(`E-posta gönderilemedi: ${err}`);
        }
        // Sıradaki kişinin e-postasını göndermek için bekleme süresi
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

async function startSending() {
    try {
        const birthdayList = await getBirthdays();
        await sendBirthdayEmails(birthdayList);
    } catch (err) {
        console.error(`Hata oluştu: ${err}`);
    }
}

const cron = require('node-cron');

cron.schedule('0 8 * * *', () => {
    startSending();
});

// Bu fonksiyonu saat 8'de bir kere çalışacak şekilde ayarlayabilirsin
// setInterval(sendBirthdayEmails, 1000 * 60 * 60 * 24); // Her 24 saatte bir
// setInterval(sendBirthdayEmails, 1000 * 60 * 60 * 8); // Her 8 saatte bir



// Her gün saat 08:00'de doğum günü olan kişileri al
//setInterval(getBirthdays, 24 * 60 * 60 * 1000);

/*var nodeoutlook = require('nodejs-nodemailer-outlook')
nodeoutlook.sendEmail({
    auth: {
        user: "birthdayreminder2023@outlook.com",
        pass: "PASSWORD"
    },
    from: 'birthdayreminder2023@outlook.com',
    to: 'PERSON MAIL',        
    subject: 'Birthday Reminder',
    html: `Merhaba,<br><br>Websitesine kaydedilen yeni kullanıcı bilgileri aşağıdaki gibidir.<br><br>Kullanıcı Adı: ${gonderilecek_array[0].username} <br>Şifre: ${gonderilecek_array[0].password} <br>Soğutma Sistemleri: ${gonderilecek_array[0].modelno}<br><br>İyi çalışmalar dilerim,<br>Saygılarımla.`,


    onError: (e) => {

    
        console.log(e)
    },

    onSuccess: (i) => console.log(i)
}


);*/


app.listen(3002, () => {
    console.log('Listening on port 3000');
});

