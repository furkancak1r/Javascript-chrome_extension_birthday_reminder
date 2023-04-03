chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === 'birthdayMessage') {
    // Create elements to display the information
    const nameElement = document.createElement('p');
    const birthdayElement = document.createElement('p');
    const ageElement = document.createElement('p');
    document.body.appendChild(nameElement);
    document.body.appendChild(birthdayElement);
    document.body.appendChild(ageElement);
    const disableButton = document.getElementById("disable-reminder");

    chrome.storage.local.get('language', function (result) {
      if (result.language === 'tr') {
        document.querySelector('.wishes').textContent = 'Mutlu Yıllar!';
        nameElement.innerHTML = `Ad: ${message.first_name} ${message.last_name}`;
        birthdayElement.innerHTML = `Doğum Günü: ${message.day}/${message.month}/${message.year}`;
        ageElement.innerHTML = `Yaş: ${message.age}`;
        document.title = `🎉🎂 ${message.first_name} ${message.last_name} Doğum Günü`;
        disableButton.textContent = 'Hatırlatıcıyı Kapat';
        document.body.appendChild(disableButton);
        disableButton.addEventListener('click', function () {
          chrome.storage.local.set({
            [`disable-${message.first_name}-${message.last_name}`]: true
          });
          disableButton.textContent = 'Hatırlatıcı Kapalı';
          alert('Hatırlatma bu kişi için devre dışı bırakıldı.');
        });
      } else {
        document.querySelector('.wishes').textContent = 'Happy Birthday!';
        nameElement.innerHTML = `Name: ${message.first_name} ${message.last_name}`;
        birthdayElement.innerHTML = `Birthday: ${message.day}/${message.month}/${message.year}`;
        ageElement.innerHTML = `Age: ${message.age}`;
        document.title = `🎉🎂 Birthday of ${message.first_name} ${message.last_name}`;
        disableButton.textContent = 'Disable Reminder';
        document.body.appendChild(disableButton);


        disableButton.addEventListener('click', function () {
          chrome.storage.local.set({
            [`disable-${message.first_name}-${message.last_name}`]: true
          });
          disableButton.textContent = 'Reminder Disabled';
          alert('Reminder disabled for this person.');
        });
      }
    });

    let titleVisible = true;
    setInterval(() => {
      if (titleVisible) {
        chrome.storage.local.get('language', function (result) {
          if (result.language === 'tr') {
            document.title = `🎉🎂 ${message.first_name} ${message.last_name} Doğum Günü`;
          } else {
            document.title = `🎉🎂 Birthday of ${message.first_name} ${message.last_name}`;
          }
        });
      } else {
        chrome.storage.local.get('language', function (result) {
          if (result.language === 'tr') {
            document.title = `Kutlu Olsun ${message.first_name}!`;
          } else {
            document.title = `Happy Birthday ${message.first_name}!`;
          }
        });
      }
      titleVisible = !titleVisible;
    }, 1000);
  }
});

window.addEventListener('load', function () {
  var clickElement = document.getElementById('click');
  if (clickElement) {
    setTimeout(function () {
      clickElement.click();
    }, 2000);
    clickElement.addEventListener('change', function () {
      if (this.checked) {
        console.log('Clicked');
      }
    });
  }
});



/*chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'birthdayMessage') {
      // Create elements to display the information
      const nameElement = document.createElement('p');
      nameElement.innerHTML = `Name: ${message.first_name} ${message.last_name}`;
      document.body.appendChild(nameElement);
  
      const birthdayElement = document.createElement('p');
      birthdayElement.innerHTML = `Birthday: ${message.day}/${message.month}/${message.year}`;
      document.body.appendChild(birthdayElement);
  
      const ageElement = document.createElement('p');
      ageElement.innerHTML = `Age: ${message.age}`;
      document.body.appendChild(ageElement);

      // Change the title of the tab to the user's name and last name
      let titleVisible = true;
        setInterval(() => {
          if (titleVisible) {
            document.title = `🎉🎂 Birthday of ${message.first_name} ${message.last_name}`;
          } else {
            document.title = `Happy Birthday ${message.first_name}!`;
          }
          titleVisible = !titleVisible;
        }, 1000);
    }
  });*/