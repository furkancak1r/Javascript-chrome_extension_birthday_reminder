
const clientId = "559438139153-dpl1b0n0h8s2pokpcuuft50mfro2kqq4.apps.googleusercontent.com";
const clientSecret = "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";

const redirectUri = chrome.identity.getRedirectURL();
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method === 'getAuthToken') {
    chrome.identity.launchWebAuthFlow({
      url: `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/userinfo.email&prompt=select_account`,
      interactive: true
    }, function (responseUrl) {
      const code = responseUrl.substring(responseUrl.indexOf('code=') + 5);
      fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`
      })
        .then(response => response.json())
        .then(data => {
          fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${data.access_token}`, {
            method: 'GET'
          })
            .then(response => response.json())
            .then(data => {
              var user_email = data.email;
              sendResponse({ email: user_email });

            })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
    });
    return true;
  }
});


chrome.runtime.onStartup.addListener(async function () {
  try {
    const { user_email } = await chrome.storage.local.get('user_email');
    if (user_email) {
      const response = await fetch(`https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user/${user_email}`);
      if (!response.ok) {
        throw new Error('Sunucudan hata alındı.');
      }
      const data = await response.json();
      const today = new Date();
      const birthdays = data.filter(person => {
        return parseInt(person.birthday_day) === today.getDate() && parseInt(person.birthday_month) === today.getMonth() + 1;
      });
      if (birthdays.length > 0) {
        birthdays.forEach(birthdayPerson => { // birthdayPerson değişkeni artık sadece bir kişiyi temsil etmiyor, tüm doğum günü olan kişileri içeren bir dizi.
          const reminderKey = `disable-${birthdayPerson.first_name}-${birthdayPerson.last_name}`;
          chrome.storage.local.get(reminderKey, function (result) {
            if (!result[reminderKey]) {
              const birthdayMessage = {
                first_name: birthdayPerson.first_name,
                last_name: birthdayPerson.last_name,
                day: parseInt(birthdayPerson.birthday_day),
                month: parseInt(birthdayPerson.birthday_month),
                year: parseInt(birthdayPerson.birthday_year),
                age: new Date().getFullYear() - parseInt(birthdayPerson.birthday_year)
              };
              chrome.tabs.create({ url: chrome.runtime.getURL('celebration.html') }, function (tab) {
                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                  if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.sendMessage(tab.id, {
                      type: 'birthdayMessage',
                      first_name: birthdayMessage.first_name,
                      last_name: birthdayPerson.last_name,
                      day: birthdayMessage.day,
                      month: birthdayMessage.month,
                      year: birthdayMessage.year,
                      age: birthdayMessage.age
                    });             
                  }
                });
              });
            };
          });
        });
      }
    }
  } catch (error) {
    console.error('Kutlamak için Doğum günü bilgileri alınırken hata oluştu:', error);
  }
});












/*
chrome.runtime.onStartup.addListener(async function () {
  try {
    const { user_email } = await chrome.storage.local.get('user_email');
    if (user_email) {
      const response = await fetch(`https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user/${user_email}`);
      if (!response.ok) {
        throw new Error('Sunucudan hata alındı.');
      }
      const data = await response.json();
      const today = new Date();
      const birthdays = data.filter(person => {
        return parseInt(person.birthday_day) === today.getDate() && parseInt(person.birthday_month) === today.getMonth() + 1;
      });
      if (birthdays.length > 0) {
        birthdays.forEach(birthdayPerson => { // birthdayPerson değişkeni artık sadece bir kişiyi temsil etmiyor, tüm doğum günü olan kişileri içeren bir dizi.
          const birthdayMessage = {
            first_name: birthdayPerson.first_name,
            last_name: birthdayPerson.last_name,
            day: parseInt(birthdayPerson.birthday_day),
            month: parseInt(birthdayPerson.birthday_month),
            year: parseInt(birthdayPerson.birthday_year),
            age: new Date().getFullYear() - parseInt(birthdayPerson.birthday_year)
          };
          chrome.tabs.create({ url: chrome.runtime.getURL('celebration.html') }, function (tab) {
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (info.status === 'complete' && tabId === tab.id) {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.sendMessage(tab.id, {
                  type: 'birthdayMessage',
                  first_name: birthdayMessage.first_name,
                  last_name: birthdayPerson.last_name,
                  day: birthdayMessage.day,
                  month: birthdayMessage.month,
                  year: birthdayMessage.year,
                  age: birthdayMessage.age
                });
              }
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('Kutlamak için Doğum günü bilgileri alınırken hata oluştu:', error);
  }
});*/




/*
chrome.storage.local.get('user_email', async function (result) {
  const user_email = result.user_email;
  if (user_email) {
      try {
          const response = await fetch(`https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user/${user_email}`);
          if (!response.ok) {
              throw new Error('Sunucudan hata alındı.');
          }
          const data = await response.json();
          const today = new Date();
          const birthdays = data.filter(person => {
              return parseInt(person.birthday_day) === today.getDate() && parseInt(person.birthday_month) === today.getMonth() + 1;
          });
          if (birthdays.length > 0) {
              const birthdayPerson = birthdays[0];
              const birthdayMessage = {
                first_name: birthdayPerson.first_name,
                last_name:birthdayPerson.last_name,
                  day: parseInt(birthdayPerson.birthday_day),
                  month: parseInt(birthdayPerson.birthday_month),
                  year: parseInt(birthdayPerson.birthday_year),
                  age: new Date().getFullYear() - parseInt(birthdayPerson.birthday_year)
              };
              // Yeni bir sekme aç ve mesajı bu sekmeye gönder
              chrome.tabs.create({ url: chrome.runtime.getURL('celebration.html') }, function(tab) {
                // celebration.html sayfasına yüklenme tamamlandıktan sonra mesaj gönder
                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                  if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    chrome.tabs.sendMessage(tab.id, {
                      type: 'birthdayMessage',
                      first_name: birthdayMessage.first_name,
                      last_name:birthdayPerson.last_name,
                      day: birthdayMessage.day,
                      month: birthdayMessage.month,
                      year: birthdayMessage.year,
                      age: birthdayMessage.age
                    });
                  }
                });
              });
              
          }
      } catch (error) {
          console.error('Kutlamak için Doğum günü bilgileri alınırken hata oluştu:', error);
      }
  }
});
*/