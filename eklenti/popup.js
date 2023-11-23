// Oturum açma işlemi başarılı
// Burada diğer işlemlerinizi yapabilirsiniz
var user_email = "";
function checkInputs() {
  let inputs = document.querySelectorAll('input');
  let hasEmptyInput = false;

  inputs.forEach(function (input) {
    if (!input.value) {
      input.style.borderColor = 'red';
      input.animate([
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0px)' },
      ], {
        duration: 500,
        iterations: 1
      }).onfinish = function () {
        setTimeout(function () {
          input.style.animation = '';
        }, 2000);
      };
      hasEmptyInput = true;
    } else {
      input.style.borderColor = '';
      input.style.animation = '';
    }
  });

  return !hasEmptyInput;
}

function handleInputChange(event) {
  const input = event.target;
  if (input.value) {
    input.style.borderColor = '';
    input.style.animation = '';
  }
}

let inputs = document.querySelectorAll('input');
inputs.forEach(function (input) {
  input.onchange = handleInputChange;
});


function dil_tr() {

  document.getElementById("dgh").textContent = "Doğum Günü Hatırlatıcısı";
  document.getElementById("email-label").textContent = "Giriş yapılan kullanıcı e-mail:";
  document.getElementById("add-info").textContent = "Lütfen eklemek istediğiniz kişinin bilgilerini giriniz:";
  document.getElementById("submit-button").textContent = "Gönder";
  document.getElementById("show-button").textContent = "Kişileri Göster";
  document.getElementById("logout-button").textContent = "Oturumu Kapat";
  document.getElementById("login").textContent = "Google ile Oturum Aç";
  document.getElementById("first-name").placeholder = "Ad";
  document.getElementById("last-name").placeholder = "Soyad";

}

function dil_eng() {
  document.getElementById("dgh").textContent = "Birthday Reminder";
  document.getElementById("email-label").textContent = "Logged in user email:";
  document.getElementById("add-info").textContent = "Please enter the information of the person you want to add:";
  document.getElementById("submit-button").textContent = "Submit";
  document.getElementById("show-button").textContent = "Show Contacts";
  document.getElementById("logout-button").textContent = "Logout";
  document.getElementById("login").textContent = "Login with Google";
  document.getElementById("first-name").placeholder = "Name";
  document.getElementById("last-name").placeholder = "Surname";
}

chrome.storage.local.get('language', function (result) {
  if (result.language === '' || result.language === "" || result.language === NaN || result.language === null) {
    chrome.storage.local.set({ "language": "eng" });
  };

  if (result.language === 'tr') {

    dil_tr();

  }
  if (result.language === 'eng') {

    dil_eng();

  }

});

// Save "eng" variable to chrome.storage.local when English flag is clicked
document.getElementById("england_flag").addEventListener("click", function () {
  chrome.storage.local.set({ "language": "eng" }, function () {
    dil_eng();
  });
});

// Save "tr" variable to chrome.storage.local when Turkish flag is clicked
document.getElementById("turkey_flag").addEventListener("click", function () {
  chrome.storage.local.set({ "language": "tr" }, function () {

    dil_tr();
  });
});

var userLang = navigator.language;

const showButton = document.getElementById('show-button');
const birthdayList = document.getElementById('birthday-list');
let isShowingBirthdays = false;
// Retrieve the user email from local storage
function checkUserEmail() {

  chrome.storage.local.get('user_email', async function (result) {
    if (result.user_email) {
      const user_email = result.user_email;


      // Get the DOM elements
      const showButton = document.getElementById('show-button');
      const birthdayList = document.getElementById('birthday-list');

      // Initialize the showing flag
      let isShowingBirthdays = false;

      // Add an event listener to the show button
      showButton.addEventListener('click', async () => {
        if (isShowingBirthdays) {
          // If the birthdays are currently shown, hide them
          birthdayList.innerHTML = '';
          showButton.innerText = 'Kişileri Göster';
          isShowingBirthdays = false;
        } else {
          try {
            // If the birthdays are currently hidden, show them
            const data = await fetchBirthdayData(user_email);
            const listHtml = generateListHtml(data);
            birthdayList.innerHTML = listHtml;
            showButton.innerText = 'Kişileri Gizle';
            isShowingBirthdays = true;
            addDeleteListeners(user_email);
          } catch (error) {
            console.error('Doğum günü bilgileri alınırken hata oluştu:', error);
          }
        }
      });

      // Retrieve the birthday data from the server
      async function fetchBirthdayData(user_email) {
        const response = await fetch(`https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user/${user_email}`);
        if (!response.ok) {
          throw new Error('Sunucudan hata alındı.');
        }
        const data = await response.json();
        return data;
      }

      // Refresh the birthday list
      async function refreshBirthdayList(user_email) {
        try {
          const data = await fetchBirthdayData(user_email);
          const listHtml = generateListHtml(data);
          birthdayList.innerHTML = listHtml;
          showButton.innerText = 'Kişileri Gizle';
          isShowingBirthdays = true;
          addDeleteListeners(user_email);
        } catch (error) {
          console.error('Doğum günü bilgileri alınırken hata oluştu:', error);
        }
      }

      // Generate the HTML for the birthday list
      function generateListHtml(data) {
        let listHtml = '<ul style="list-style:none;text-align: left;padding-left: 7px;">';
        data.forEach(person => {
          listHtml += `<li><img src="src/images/trash.png" alt="delete" width="10 px" height="10 px" style="vertical-align: middle; margin-right: 5px;"/>${person.first_name} ${person.last_name} - <span class="birthday-date">${person.birthday_day}/${person.birthday_month}/${person.birthday_year}</span> </li>`;
        });
        listHtml += '</ul>';
        return listHtml;
      }

      // Add event listeners to the delete icons
      function addDeleteListeners(user_email) {
        const trashIcons = document.querySelectorAll("img[src='src/images/trash.png']");
        trashIcons.forEach(icon => {
          icon.addEventListener('click', async () => {
            try {
              const listItem = icon.closest('li');
              const fullName = listItem.textContent.trim();
              const [name, birthDate] = fullName.split(" - ");
              const [firstName, lastName] = name.split(" ");
              const url = `https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user/${user_email}/${firstName}/${lastName}`;

              // Send a DELETE request to the server
              const response =
                await fetch(url, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json"
                  }
                });
              if (!response.ok) {
                throw new Error('Sunucudan hata alındı.');
              }
              const data = await response.json();
              console.log(data);

              chrome.storage.local.get("language", function (result) {
                if (result.language === "tr") {
                  alert(`${firstName} ${lastName} isimli kişi başarıyla silindi!`);
                } else {
                  alert(`${firstName} ${lastName} has been successfully deleted!`);
                }
              });
              // Refresh the list of birthdays
              await refreshBirthdayList(user_email);
            } catch (error) {
              console.error('Doğum günü bilgisi silinirken hata oluştu:', error);
            }
          });
        });
      }

      document.getElementById("submit-button").addEventListener("click", async function () {

        if (!checkInputs()) {
          return;
        }

        var firstName = document.getElementById("first-name").value;
        var lastName = document.getElementById("last-name").value;
        var birthday = document.getElementById("birthday").value;
        var [year, month, day] = birthday.split("-");

        let isExistingPerson = false;
        // Check if person is already registered
        try {
          var response = await fetch(`https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user/${user_email}`);
          isExistingPerson = false;

          if (!response.ok) {
            console.log('Sunucudan hata alındı.');
            kayitliemailvarmi = false;

          } else {
            kayitliemailvarmi = true;
          }
          if (kayitliemailvarmi) {
            var data = await response.json();
            data.forEach(person => {
              if (person.first_name === firstName && person.last_name === lastName && person.birthday_day === day && person.birthday_month === month && person.birthday_year === year) {
                isExistingPerson = true;
              }
            });
          }
          if (isExistingPerson) {
            chrome.storage.local.get("language", function (result) {
              if (result.language === "tr") {
                alert(`${firstName} ${lastName} zaten kayıtlı.`);
              } else {
                alert(`${firstName} ${lastName} is already registered.`);
              }
            });
            document.getElementById("first-name").value = "";
            document.getElementById("last-name").value = "";
            document.getElementById("birthday").value = "";
            return;
          } else {
            // Send POST request to server
            var response = await fetch(`https://www.backend-birthday-reminder.furkancakir.dev/api_birthday_reminder/birthday_info_user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                user_email: user_email,
                first_name: firstName,
                last_name: lastName,
                birthday_day: day,
                birthday_month: month,
                birthday_year: year
              })
            });
            if (!response.ok) {
              var errorMessage = await response.text();
              throw new Error(`Sunucudan hata alındı: ${errorMessage}`);
            }
            else {
              document.getElementById("first-name").value = "";
              document.getElementById("last-name").value = "";
              document.getElementById("birthday").value = "";
            }

            await refreshBirthdayList(user_email);
            chrome.storage.local.get("language", function (result) {
              if (result.language === "tr") {
                alert(`${firstName} ${lastName} başarıyla eklendi.`);
              } else {
                alert(`${firstName} ${lastName} has been successfully added.`);
              }
            });
          }

        } catch (error) {
          console.error('Kişi eklenirken bir hata oluştu:', error);
        }
      });

    } else {
      setTimeout(checkUserEmail, 1000);
    }
  });
};

document.addEventListener('DOMContentLoaded', function () {

  // Check for and set last used email
  chrome.storage.local.get(['user_email'], function (result) {
    if (result.user_email) {
      document.getElementById('email').innerHTML = result.user_email;
      document.getElementById('form-container').style.display = 'block';
      document.getElementById('login').style.display = 'none';

    }
  });

  // Add event listener for login button
  document.getElementById('login').addEventListener('click', async function () {
    chrome.runtime.sendMessage({ method: "getAuthToken" }, function (response) {
      const user_email = response.email;
      console.log(user_email); // önce log'lamalısınız çünkü chrome.runtime.sendMessage asenkron bir işlem
      chrome.storage.local.set({ "user_email": user_email }, function () {
        //console.log("User email saved to storage: " + user_email);
      });

      if (user_email !== "" || user_email !== null) {
        document.getElementById('form-container').style.display = 'block';
        document.getElementById('login').style.display = 'none';
      }
    });
  });

  // Add event listener for logout button
  // logout-button üzerine click event listener eklenmesi
  document.getElementById('logout-button').addEventListener('click', function () {
    // isShowingBirthdays değişkeninin false değerine dönüştürülmesi
    isShowingBirthdays = false;
    // birthdayList.innerHTML'in temizlenmesi
    birthdayList.innerHTML = '';
    chrome.storage.local.set({ "user_email": "" }, function () {
      //console.log("User email saved to storage: " + user_email);
    });

    // Formu gizleme
    document.getElementById('form-container').style.display = 'none';

    // Oturum Aç butonunu görünür hale getirme
    document.getElementById('login').style.display = 'block';
  });

  // Check for changes to user_email in storage
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "local" && changes.user_email) {
      if (changes.user_email.newValue) {
        document.getElementById('email').innerHTML = changes.user_email.newValue;
        document.getElementById('form-container').style.display = 'block';
        document.getElementById('login').style.display = 'none';
      } else {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('login').style.display = 'block';
      }
    }
  });

});

checkUserEmail();