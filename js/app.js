import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore,doc,getDoc,getDocs, setDoc,collection, addDoc,updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth,signOut,deleteUser, EmailAuthProvider,reauthenticateWithCredential ,sendPasswordResetEmail,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBClbHDRPgfhjp7hLSt7Wecci6yUN_5y_U",
    authDomain: "expense-manager-f3297.firebaseapp.com",
    projectId: "expense-manager-f3297",
    storageBucket: "expense-manager-f3297.appspot.com",
    messagingSenderId: "972776133800",
    appId: "1:972776133800:web:59fa1b1619c1bd41965e9d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    createPrimaryElements(user.uid,user.email);

    displayNotifications(user.uid);

  } else {
    createCredentialSection();
  }
});

async function displayNotifications(userID) {
  // Fetch tasks for the user
  let taskManager = [];
  const querySnapshot = await getDocs(collection(db, "user", userID, 'Tasks'));
  querySnapshot.forEach((doc) => {
    let data = doc.data();
    data.id = doc.id;
    taskManager.push(data);
  });

  // Get current date
  const today = new Date();
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const currentDate = today.toLocaleDateString('en-US', options); // Format: MM/DD/YYYY

  // Convert date strings to match the currentDate format
  const tasksForToday = taskManager.filter(task => {
    // Parse task date string to a JavaScript Date object
    const taskDate = new Date(task.date);
    const taskDateString = taskDate.toLocaleDateString('en-US', options);
    return taskDateString === currentDate && task.set_status !== 'Completed';
  });

  // Create and append notification container to the body
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'notification-container';
  document.body.appendChild(notificationContainer);

  // Loop through tasks and display notifications with delay
  for (let i = 0; i < tasksForToday.length; i++) {
    const task = tasksForToday[i];
    const notificationDiv = document.createElement('div');
    notificationDiv.classList.add('notification', 'display');

    // Create inner divs for icon and content
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('notification-icon-container');
    iconContainer.innerHTML = '<span><i class="fa fa-bell-ringing"></i></span>';

    const contentContainer = document.createElement('div');
    contentContainer.classList.add('notification-content');

    const h3 = document.createElement('h3');
    const p = document.createElement('p');

    h3.textContent = task.name;
    p.innerHTML = `Status:${task.set_status} - Due:${formatTimeStamp(task.date)}`;

    contentContainer.appendChild(h3);
    contentContainer.appendChild(p);

    notificationDiv.appendChild(iconContainer);
    notificationDiv.appendChild(contentContainer);

    notificationContainer.appendChild(notificationDiv);

    // Display each notification for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for 4 seconds

    // Toggle classes after 4 seconds
    notificationDiv.classList.toggle('display');
    notificationDiv.classList.toggle('disappear');

    // Wait for another second before removing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

    notificationDiv.remove(); // Remove after 5 seconds
  }
}

//=====================================//
function createCredentialSection(){
  // Create main container section
  const credentialContainer = document.createElement('section');
  credentialContainer.classList.add('credential-container');

  // Create credential header container
  const credentialHeader = document.createElement('div');
  credentialHeader.classList.add('credential-header');
  // Create logo image element
  const logoImg = document.createElement('img');
  logoImg.src = 'img/spend.png';
  logoImg.alt = 'SpendWise';
  // Create div for site title and slogan
  const siteTitleSlogan = document.createElement('div');
  siteTitleSlogan.classList.add('site-title-slogan');
  const heading = document.createElement('h1');
  heading.textContent = 'SpendWise';
  const slogan = document.createElement('p');
  slogan.textContent = 'Manage Your Finances Wisely';

  siteTitleSlogan.appendChild(heading);
  siteTitleSlogan.appendChild(slogan);
  credentialHeader.appendChild(logoImg);
  credentialHeader.appendChild(siteTitleSlogan);
  credentialContainer.appendChild(credentialHeader);

  //-----------------------------------------------//
  const credentialTabContainer = document.createElement('div');
  credentialTabContainer.classList.add('tab-container');

  // Create tabs container
  const tabsContainer = document.createElement('div');
  tabsContainer.classList.add('tabs');

  // Create login tab
  const loginTab = document.createElement('button');
  loginTab.textContent = 'Log In';
  loginTab.classList.add('tab', 'active');
  loginTab.addEventListener('click', () => {
      showTab(loginTab, loginFormContainer);
  });

  // Create sign up tab
  const signUpTab = document.createElement('button');
  signUpTab.textContent = 'Register';
  signUpTab.classList.add('tab');
  signUpTab.addEventListener('click', () => {
      showTab(signUpTab, registerFormContainer);
  });

  // Append tabs to the tabs container
  tabsContainer.appendChild(loginTab);
  tabsContainer.appendChild(signUpTab);

  // Create login form
  const loginFormContainer = document.createElement('div');
  loginFormContainer.classList.add('tab-content','active');
  const inputDetails = [
    {type: 'email',label: 'Email'},
    {type: 'password',label: 'Password'}];

  const logInheading = document.createElement('h1');
  logInheading.textContent = 'Log In Form';
  loginFormContainer.insertBefore(logInheading, loginFormContainer.firstChild);

  const logInForm = generateForm(inputDetails,"Log In");
  loginFormContainer.appendChild(logInForm);
  // Create forgot password button
  const forgotPasswordButton = document.createElement('button');
  forgotPasswordButton.classList.add('forgotPassBtn');
  forgotPasswordButton.type = 'button';
  forgotPasswordButton.textContent = 'Forgot Password ?';
  // Append forgot password button to the form
  logInForm.appendChild(forgotPasswordButton);
  logInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Get the login button
      const loginButton = logInForm.querySelector('button[type="submit"]');
      loginButton.disabled = true;
      loginButton.innerHTML = '<i class="fa fa-spinner spin"></i>';

      const emailInput = logInForm.querySelector('input[name="email"]');
      const passwordInput = logInForm.querySelector('input[name="password"]');
      if(validateEmail(emailInput.value)){
        if(passwordInput.value.length >= 8){
          signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
            .then((userCredential) => {
              // Signed in 
              const user = userCredential.user;
              // createModal("Welcome Back !!",`<h3>Hi, ${emailInput.value}</h3><p>Welcome back! You have successfully logged in. Enjoy your browsing experience!</p>`)
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode);
              console.log(errorMessage);
              if(errorCode === "auth/invalid-credential"){
                createModal("Warning","User Not Found");
              }
              loginButton.disabled = false;
              loginButton.innerHTML = 'Log In';
            });
        }else{
          createModal("Warning","Password must be at least 8 characters long");
          loginButton.disabled = false;
          loginButton.innerHTML = 'Log In';
        }
      }else{
        createModal("Warning","Invalid email address");
        loginButton.disabled = false;
        loginButton.innerHTML = 'Log In';
      }
  });

  forgotPasswordButton.addEventListener('click', () => {
    const emailInput = logInForm.querySelector('input[name="email"]');
    const emailValue = emailInput.value.trim();
    if (emailValue) {
        sendPasswordResetEmail(auth, emailValue)
        .then(() => {
          let msg = `<strong>A password reset email has been sent to your email address.</strong><br><ul><li>Check your email inbox.</li><li>If you don't see the email, check your spam/junk folder.</li><li>Make sure you have entered the correct email address.</li><li>If you have not received email yet, you may have registered with an invalid email address.</li></ul>`
          createModal('Reset', msg);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          createModal('Warning !!','There might have any technical issue. Please, try again.');
        });
    } else {
        createModal('Warning !!','Please, enter a valid email address to reset your password.');
    }
  });

  // Create sign up form
  const registerFormContainer = document.createElement('div');
  registerFormContainer.classList.add('tab-content');
  const registerInputs = [
    {type: 'email',label: 'Email'},
    {type: 'password',label: 'Password'}];

  const registerheading = document.createElement('h1');
  registerheading.textContent = 'Register Form';
  registerFormContainer.insertBefore(registerheading, registerFormContainer.firstChild);

  const registerForm = generateForm(registerInputs,"Register");
  registerFormContainer.appendChild(registerForm);
  registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const registerButton = registerForm.querySelector('button[type="submit"]');
      registerButton.disabled = true;
      registerButton.innerHTML = '<i class="fa fa-spinner spin"></i>';
      // Access the form inputs by their names or IDs
      const emailInput = registerForm.querySelector('input[name="email"]');
      const passwordInput = registerForm.querySelector('input[name="password"]');
      if(validateEmail(emailInput.value)){
        if(passwordInput.value.length >= 8){
          createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
            .then((userCredential) => {
              // Signed up
              const user = userCredential.user;
              // Get current year and month
              const currentDate = new Date();
              const currentYear = currentDate.getFullYear().toString();
              const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
              // Create references for empty paths
              const yearMonthRef = doc(db, "user", user.uid, currentYear, currentMonth);
              // Create empty objects (optional for clarity)
              const yearMonthData = {
                income: [],
                expense: [],
                cashOut: [],
                month: currentMonth
              };
              try{
                setDoc(yearMonthRef, yearMonthData),
                // console.log("Empty paths created and user registered successfully!");
                createModal("Congratulations !!", "Thank you for registering! Your account has been successfully created. Welcome aboard");
              }catch (error) {
                console.error("Error adding document: ", error);
              }
              registerButton.disabled = false;
              registerButton.textContent = "Register";
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.error(errorCode, errorMessage);
              if(errorCode === "auth/email-already-in-use"){
                createModal("Warning","This Email is already registered. Try again with different Email address.");
                registerButton.disabled = false;
                registerButton.textContent = "Register";
              }
            });
        }else{
          createModal("Warning","Password must be at least 8 characters long");
          registerButton.disabled = false;
          registerButton.textContent = "Register";
        }
      }else{
        createModal("Warning","Invalid email address");
        registerButton.disabled = false;
        registerButton.textContent = "Register";
      }
  })

  // Append tabs and forms to the credential container
  credentialTabContainer.appendChild(tabsContainer);
  credentialTabContainer.appendChild(loginFormContainer);
  credentialTabContainer.appendChild(registerFormContainer);
  credentialContainer.appendChild(credentialTabContainer)
  // Append the credential container section to the main tag
  let mainTag = document.querySelector('main');
  mainTag.innerHTML = "";
  mainTag.appendChild(credentialContainer);
};

function showTab(selectedTab, selectedForm) {
  // Remove 'active' class from all tabs and forms
  const allTabs = document.querySelectorAll('.tab');
  allTabs.forEach(tab => {
      tab.classList.remove('active');
  });
  const allForms = document.querySelectorAll('.tab-content');
  allForms.forEach(form => {
      form.classList.remove('active');
  });

  // Add 'active' class to the selected tab and form
  selectedTab.classList.add('active');
  selectedForm.classList.add('active');
}


//=====================================//
async function createPrimaryElements(userID,userEmail) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

  // Create nav-container div
  const navContainer = document.createElement('div');
  navContainer.setAttribute('id', 'nav-container');

  // Create main-container div
  const mainContainer = document.createElement('div');
  mainContainer.setAttribute('id', 'main-container');
  // Append nav-container and main-container to main tag
  const mainTag = document.querySelector('main');
  mainTag.innerHTML = "";
  mainTag.appendChild(navContainer);
  mainTag.appendChild(mainContainer);
  // Create ul and li elements for navigation
  const navList = document.createElement('ul');
  // Create and append li elements
  const items = [
    { name: 'Home', icon: '<i class="fa fa-home" aria-hidden="true"></i>' },
    { name: 'Wallet', icon: '<i class="fa fa-google-wallet" aria-hidden="true"></i>' },
    { name: 'Update', icon: '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' },
    { name: 'To Do', icon: '<i class="fa fa-list-ul" aria-hidden="true"></i>' },
    { name: 'Setting', icon: '<i class="fa fa-cog" aria-hidden="true"></i>' },
    { name: 'SignOut', icon: '<i class="fa fa-sign-out" aria-hidden="true"></i>' }
  ];
  
  items.forEach((item,index) => {
      const liElement = document.createElement('li');
      liElement.innerHTML = item.icon;
      liElement.setAttribute('data-name', item.name);
      if(index === 0){
        liElement.classList.add('active');
      }

      liElement.addEventListener('click', async function() {
          navList.querySelectorAll('li').forEach(li => {
              li.classList.remove('active');
          });
          liElement.classList.add('active');

          if(item.name == 'Home'){
            displayLoadingAnimation();
            const docSnap = await getDoc(doc(db, "user", userID, currentYear, currentMonth));

            if (docSnap.exists()) {
              const homeSection = createHomeSection(docSnap.data(),userEmail);
              mainContainer.innerHTML = "";
              mainContainer.appendChild(homeSection);
            } else {
              const newMonthContent = {
                  newMonth: true,
                  user: userID,
                  message: `
                      <h2>Thank you for staying with us.</h2>
                      <p>Your commitment to our platform is greatly appreciated.</p>
                      <p>We invite you to start a new month. Are you ready to begin?</p>
                  `
              };
            
              createModal("Congratulations !!",newMonthContent);
            }
            removeLoadingAnimation();
          }else if(item.name == 'Wallet'){
            displayLoadingAnimation();
            let bankData = [];
            const querySnapshot = await getDocs(collection(db, "user", userID,"bank"));
            querySnapshot.forEach((doc) => {
              bankData.push(doc.data());
            });
            const walletSection = createWalletSection(userID,bankData);
            mainContainer.innerHTML = "";
            mainContainer.appendChild(walletSection);
            
          }else if(item.name == 'Update'){
            const updateSection = createUpdateSection(userID);
            mainContainer.innerHTML = "";
            mainContainer.appendChild(updateSection);
          }else if(item.name === 'SignOut'){
            signOut(auth).then(() => {
              console.log('sign out !!')
            }).catch((error) => {
              
            });
          }else if(item.name == "To Do"){
            displayLoadingAnimation();
            let taskManager = [];
            const querySnapshot = await getDocs(collection(db, "user",userID,'Tasks'));
            querySnapshot.forEach((doc) => {
              let data = doc.data();
              data.id = doc.id;
              taskManager.push(data);
            });
            const toDoSection = createToDoSection(userID,taskManager);
            mainContainer.innerHTML = "";
            mainContainer.appendChild(toDoSection);
            removeLoadingAnimation();
          }else if(item.name == "Setting"){
            const settingSection = createSettingsSection(userID,userEmail);
            mainContainer.innerHTML = "";
            mainContainer.appendChild(settingSection);
          }
      });
      navList.appendChild(liElement);
      if (index === 0) {
        liElement.click();
    }
  });
  // Append ul to nav-container
  navContainer.appendChild(navList);

  let isNavOpen = false; // Variable to track the state of navigation

  if (window.innerWidth <= 768) {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'toggle-container';
    const toggleSpan = document.createElement('i');
    toggleSpan.className = "fa fa-chevron-right";

    toggleContainer.appendChild(toggleSpan);
    navContainer.appendChild(toggleContainer);

    let touchStartX = null;
    // Function to toggle navigation visibility
    const toggleNavVisibility = () => {
        if (isNavOpen) {
            navContainer.style.transform = 'translateX(-45px)';
            toggleSpan.style.transform = 'rotate(0deg)';
        } else {
            navContainer.style.transform = 'translateX(0px)';
            toggleSpan.style.transform = 'rotate(180deg)';
        }
        isNavOpen = !isNavOpen; // Toggle the state
    };

    toggleContainer.addEventListener('click', toggleNavVisibility);

    // Add event listener to main container
    const mainContainer = document.getElementById('main-container');
    mainContainer.addEventListener('click', () => {
        if (isNavOpen) {
            toggleNavVisibility(); // Hide navContainer if it's open
        }
    });


    mainContainer.addEventListener('touchstart', (e) => {
      if (!isNavOpen){
        touchStartX = e.touches[0].clientX;
      } 
    });

    mainContainer.addEventListener('touchmove', (e) => {
      if (touchStartX && !isNavOpen) {
          const touchCurrentX = e.touches[0].clientX; // Current touch X position
          const deltaX = touchCurrentX - touchStartX; // Calculate X distance

          // If swiping from left to right (positive deltaX), reveal navContainer
          if (deltaX > 40) {
              toggleNavVisibility();
              touchStartX = null; // Reset touch start position
          }
      }
    });

    mainContainer.addEventListener('touchend', () => {
      touchStartX = null; 
    });
  }

};


function createPermissionModal(title, buttonTxt, message, confirmCallback) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal-container');
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.classList.add('modal-header');
  const headerTitle = document.createElement('h2');
  headerTitle.textContent = title;
  modalHeader.appendChild(headerTitle);
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
  closeButton.classList.add('close-btn');
  closeButton.addEventListener('click', () => {
      modalContainer.remove(); // Remove the modal from the DOM
  });
  modalHeader.appendChild(closeButton)
  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');
  const bodyText = document.createElement('p');
  bodyText.textContent = message;
  modalBody.appendChild(bodyText);

  // Create confirm button
  const confirmButton = document.createElement('button');
  confirmButton.textContent = buttonTxt;
  confirmButton.addEventListener('click', () => {
      if (confirmCallback && typeof confirmCallback === 'function') {
          confirmCallback();
      }
      modalContainer.remove(); // Assuming you have a function to close the modal
  });
  modalBody.appendChild(confirmButton);
  // Append elements to modal content
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContainer.appendChild(modalContent);

  // Append modal container to document body
  document.body.appendChild(modalContainer);
}

function hashUserIdToNumber(userId) {
  // Simple hashing algorithm
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
  }
  // Ensure the hash is positive
  hash = Math.abs(hash);
  // Ensure the hash is within 8 digits
  return ('00000000' + hash).slice(-8);
}

function createSettingsSection(userId,userEmail) {
  // Create main settings container
  const settingContainer = document.createElement('section');
  settingContainer.classList.add('setting-container');

  const sectionTitle = 'Setting';
  const sectionIcon = '<i class="fa fa-wrench" aria-hidden="true"></i>';
  const subtitle = 'Set your preference';
  const sectionHeader = createSectionHeader(sectionTitle, sectionIcon, subtitle);
  settingContainer.appendChild(sectionHeader);

  const settingOptions = document.createElement('div');
  settingOptions.classList.add('setting-options');
  // Create user ID container
  const userIdContainer = document.createElement('div');
  userIdContainer.classList.add('userid-container');
  const userIdHeading = document.createElement('h3');
  userIdHeading.textContent = 'User ID:';
  const userIdValue = document.createElement('h3');
  const hideShowIconSpan = document.createElement('span');
  hideShowIconSpan.classList.add('hide-show-icon');
  hideShowIconSpan.innerHTML = '<i class="fa fa-eye"></i>'; 
  // Creating the id-value span
  const idValueSpan = document.createElement('span');
  idValueSpan.classList.add('id-value');
  idValueSpan.textContent = '********';
  hideShowIconSpan.addEventListener('click', () => {
    const isHidden = idValueSpan.textContent === '********';
    idValueSpan.textContent = isHidden ? hashUserIdToNumber(userId) : '********';
    hideShowIconSpan.innerHTML = isHidden ? '<i class="fa fa-eye-slash"></i>': '<i class="fa fa-eye"></i>';
  });
  // Appending spans to userIdValue
  userIdValue.appendChild(hideShowIconSpan);
  userIdValue.appendChild(idValueSpan);
  userIdContainer.appendChild(userIdHeading);
  userIdContainer.appendChild(userIdValue);
  

  // Create email container
  const emailContainer = document.createElement('div');
  emailContainer.classList.add('email-container');
  const emailHeading = document.createElement('h3');
  emailHeading.textContent = 'Email:';
  const emailValue = document.createElement('h3');
  emailValue.textContent = userEmail; 
  emailValue.style.textTransform = 'Capitalize';
  emailContainer.appendChild(emailHeading);
  emailContainer.appendChild(emailValue);

  // Create password container
  const passwordContainer = document.createElement('div');
  passwordContainer.classList.add('password-container');
  const passwordHeading = document.createElement('h3');
  passwordHeading.textContent = 'Password:';
  const changePasswordBtn = document.createElement('button');
  changePasswordBtn.textContent = 'Change Password';
  passwordContainer.appendChild(passwordHeading);
  passwordContainer.appendChild(changePasswordBtn);
  changePasswordBtn.addEventListener('click', () => {
    createPermissionModal('Permission Required', 'Confirm',`An email has been sent to ${userEmail}. Do you want to proceed?`, () => {
      sendPasswordResetEmail(auth, userEmail)
        .then(() => {
          // Password reset email sent!
          let msg = `<strong>A password reset email has been sent to your email address.</strong><br><ul><li>Check your email inbox.</li><li>If you don't see the email, check your spam/junk folder.</li><li>Make sure you have entered the correct email address.</li><li>If you have not received email yet, you may have registered with an invalid email address.</li></ul>`
          createModal('Success !!', msg);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          createModal('Warning', 'There might be some technical issue. Please, try again.')
        });
    });
  })

  // Create account container
  const accountContainer = document.createElement('div');
  accountContainer.classList.add('account-container');
  const accountHeading = document.createElement('h3');
  accountHeading.textContent = 'Account:';
  const deleteAccountBtn = document.createElement('button');
  deleteAccountBtn.textContent = 'Delete Account';
  accountContainer.appendChild(accountHeading);
  accountContainer.appendChild(deleteAccountBtn);
  deleteAccountBtn.addEventListener('click', () => {
    createPermissionModal('Delete Account', 'Delete', `Are you sure you want to delete your account?`, () => {
      const user = auth.currentUser;
      function promptForCredentials() {
        const email = prompt('Please enter your email address:');
        const password = prompt('Please enter your password:');
      
        if (!email || !password) {
          throw new Error('Email and password are required.');
        }
      
        return EmailAuthProvider.credential(email, password);
      }
  
      const credential = promptForCredentials();
      // Reauthenticate the user
      reauthenticateWithCredential(user, credential)
        .then(() => {
          deleteUser(user)
            .then(() => {
              createPermissionModal('Thank You','Close' ,`Your account has been successfully deleted. We're sorry to see you go. If you ever decide to come back, we'll be here for you!`, () => {
                  createCredentialSection();
              });
            })
            .catch((error) => {
              console.log(error);
              createModal('Warning','There might be some technical issue. Please, try again.')
            });
          
        })
        .catch((error) => {
          console.log(error);
          // Handle errors like invalid credentials
        });
    });

  });
  
  // Append containers to the main settings container
  settingOptions.appendChild(userIdContainer);
  settingOptions.appendChild(emailContainer);
  settingOptions.appendChild(passwordContainer);
  settingOptions.appendChild(accountContainer);
  settingContainer.appendChild(settingOptions);

  return settingContainer;
}

//==========================================//
function createSectionHeader(sectionTitle,icon, subtitle) {
    // Create section-header div
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';

    // Create header-contents div
    const headerContents = document.createElement('div');
    headerContents.className = 'header-contents';

    // Create thumbnail div for header-contents
    const thumbnailHeader = document.createElement('div');
    thumbnailHeader.className = 'thumbnail';
    thumbnailHeader.innerHTML = icon;

    // Create contents div for header-contents
    const contentsHeader = document.createElement('div');
    contentsHeader.className = 'contents';
    const titleHeader = document.createElement('h1');
    titleHeader.textContent = sectionTitle;
    const subtitleHeader = document.createElement('p');
    subtitleHeader.textContent = subtitle;
    contentsHeader.appendChild(titleHeader);
    contentsHeader.appendChild(subtitleHeader);

    // Append thumbnail and contents divs to header-contents
    headerContents.appendChild(thumbnailHeader);
    headerContents.appendChild(contentsHeader);

    // Create date-time-container div
    const dateTimeContainer = document.createElement('div');
    dateTimeContainer.className = 'date-time-container';

    // Create thumbnail div for date-time-container
    const thumbnailDateTime = document.createElement('div');
    thumbnailDateTime.className = 'thumbnail';
    // Assuming you're using Font Awesome for clock icon
    thumbnailDateTime.innerHTML = '<i class="fa fa-calendar" aria-hidden="true"></i>';

    // Create contents div for date-time-container
    const contentsDateTime = document.createElement('div');
    contentsDateTime.className = 'contents';
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-container';
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date-container';
    contentsDateTime.appendChild(timeDiv);
    contentsDateTime.appendChild(dateDiv);

    // Append thumbnail and contents divs to date-time-container
    dateTimeContainer.appendChild(thumbnailDateTime);
    dateTimeContainer.appendChild(contentsDateTime);

    // Append header-contents and date-time-container to section-header
    sectionHeader.appendChild(headerContents);
    sectionHeader.appendChild(dateTimeContainer);

    // Function to update time and date every second
    function updateTimeAndDate() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const timeFormat = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        timeDiv.textContent = `${formattedHours}:${minutes}:${seconds} ${timeFormat}`;
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        dateDiv.textContent = now.toLocaleDateString('en-US', options);
    }

    // Initial call to display time and date
    updateTimeAndDate();

    // Update time and date every second
    setInterval(updateTimeAndDate, 1000);

    return sectionHeader;
}

function parseAmount(value) {
  // Check if value is a number or a string representation of a number
  if (typeof value === 'number') {
      return value; // Return the value if it's already a number
  } else if (typeof value === 'string') {
      // Parse the string to a floating-point number
      return parseFloat(value);
  } else {
      return 0; // Return 0 if the value is neither a number nor a string
  }
}

// Function to validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function createWelcomeContainer(email) {
  // Get the current hour
  const currentHour = new Date().getHours();

  // Determine greeting based on the time of day
  let greeting;
  if (currentHour >= 6 && currentHour < 11) {
    greeting = "Good morning!";
} else if (currentHour >= 11 && currentHour < 15) {
    greeting = "Good noon!";
} else if (currentHour >= 15 && currentHour < 18) {
    greeting = "Good afternoon!";
} else if (currentHour >= 18 && currentHour < 20) {
    greeting = "Good evening!";
} else {
    greeting = "Restful night!";
}

  // Create welcome container
  const welcomeContainer = document.createElement('div');
  welcomeContainer.classList.add('welcome-container');

  // Create heading
  const heading = document.createElement('h2');
  heading.innerHTML = `${greeting} <span>${email}</span>`;
  welcomeContainer.appendChild(heading);

  // Create paragraph
  const paragraph = document.createElement('p');
  paragraph.textContent = 'Welcome back !!';
  welcomeContainer.appendChild(paragraph);

  // Return the container
  return welcomeContainer;
}

function createTable(data) {
  const table = document.createElement('table');
  const tableHead = document.createElement('thead');
  const tableBody = document.createElement('tbody');

  const headers = ['Time', 'Method', 'Amount'];
  // Create table headers
  const tableHeadRow = document.createElement('tr');
  headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      tableHeadRow.appendChild(th);
  });
  tableHead.appendChild(tableHeadRow);

  // Check if data is empty
  if (data.length === 0) {
      // Create a row with a message if data is empty
      const noDataMessage = document.createElement('tr');
      const noDataCell = document.createElement('td');
      noDataCell.setAttribute('colspan', '2'); // Set colspan to span all columns
      noDataCell.textContent = 'No data available';
      noDataMessage.appendChild(noDataCell);
      tableBody.appendChild(noDataMessage);
  } else {
      // Populate table rows with data
      data.forEach(item => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = formatTimeStamp(item.timeStamp);
        const methodCell = document.createElement('td');
        methodCell.textContent = item.select_method;
        const amountCell = document.createElement('td');
        amountCell.textContent = item.amount;
        row.appendChild(timeCell);
        row.appendChild(methodCell);
        row.appendChild(amountCell);
          tableBody.appendChild(row);
      });
  }

  // Append table head and body to the table element
  table.appendChild(tableHead);
  table.appendChild(tableBody);

  return table;
}
//=========================================//
function createHomeSection(monthData,email) {
    // Create section element
    const section = document.createElement('section');
    section.id = 'home';

    const sectionTitle = 'Dashboard';
    const sectionIcon = '<i class="fa fa-tachometer" aria-hidden="true"></i>';
    const subtitle = 'Analyze your incomes and expenses';
    const sectionHeader = createSectionHeader(sectionTitle, sectionIcon, subtitle);
    // Append sectionHeader to wherever you need it in your document
    section.appendChild(sectionHeader);
    // Create welcome container
    const welcomeContainer = createWelcomeContainer(email);
    section.appendChild(welcomeContainer);

    // Create monthly-analytics-container div
    const monthlyAnalyticsContainer = document.createElement('div');
    monthlyAnalyticsContainer.className = 'monthly-analytics-container';
    // Calculate total income
    const totalIncome = monthData.income.reduce((acc, curr) => acc + parseAmount(curr.amount), 0);

    // Calculate total expense
    const totalExpense = monthData.expense.reduce((acc, curr) => acc + parseAmount(curr.amount), 0);
    // Calculate remaining amount
    const remainingAmount = totalIncome - totalExpense;

    // Create and append total income, total expense, and remaining amount to the columns
    const columnData = [
      { label: 'Remaining', value: remainingAmount },
        { label: 'Total Income', value: totalIncome },
        { label: 'Total Expense', value: totalExpense }
    ];

    columnData.forEach((data, index) => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        if(data.label === 'Remaining'){
          columnDiv.classList.add('remaining');
        }

        const pLabel = document.createElement('p');
        pLabel.textContent = data.label;

        const h1Value = document.createElement('h1');
        h1Value.innerHTML = `<i class="fa fa-usd" aria-hidden="true"></i> ${data.value}`; // Display values with two decimal places

        columnDiv.appendChild(pLabel);
        columnDiv.appendChild(h1Value);

        monthlyAnalyticsContainer.appendChild(columnDiv);
    });
    section.appendChild(monthlyAnalyticsContainer);
    //=========================================//
    // Create total-income-expense-container div
    const totalIncomeExpenseContainer = document.createElement('div');
    totalIncomeExpenseContainer.className = 'total-income-expense-container';

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    // Create income-container div
    const incomeContainer = document.createElement('div');
    incomeContainer.className = 'income-container table-container';

    // Create h2 tag for income
    const incomeTitle = document.createElement('h2');
    incomeTitle.textContent = `Income of ${currentMonth}`;

    // Create table for income data
    const incomeTable = createTable(monthData.income);

    incomeContainer.appendChild(incomeTitle);
    incomeContainer.appendChild(incomeTable);
    

    // Create expense-container div
    const expenseContainer = document.createElement('div');
    expenseContainer.className = 'expense-container table-container';

    // Create h2 tag for expense
    const expenseTitle = document.createElement('h2');
    expenseTitle.textContent = `Expense of ${currentMonth}`;

    // Create table for expense data
    const expenseTable = document.createElement('table');
    const expenseTableHead = document.createElement('thead');
    const expenseTableBody = document.createElement('tbody');

    // Create table headers for expense table
    const expenseTableHeaders = ['Time', 'Name', 'Category', 'Amount'];
    const expenseTableHeadRow = document.createElement('tr');
    expenseTableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        expenseTableHeadRow.appendChild(th);
    });
    expenseTableHead.appendChild(expenseTableHeadRow);

    // Populate expense data into table
    if (monthData.expense.length === 0) {
      const noDataMessage = document.createElement('tr');
      const noDataCell = document.createElement('td');
      noDataCell.setAttribute('colspan', '3'); 
      noDataCell.textContent = 'No expense data available';
      noDataMessage.appendChild(noDataCell);
      expenseTableBody.appendChild(noDataMessage);
  }else{
    monthData.expense.forEach(expense => {
      const row = document.createElement('tr');
      const timeCell = document.createElement('td');
      timeCell.textContent = formatTimeStamp(expense.timeStamp);
      const nameCell = document.createElement('td');
      nameCell.textContent = expense.name;
      const categoryCell = document.createElement('td');
      categoryCell.textContent = expense.category;
      const amountCell = document.createElement('td');
      amountCell.textContent = expense.amount;
      row.appendChild(timeCell);
      row.appendChild(nameCell);
      row.appendChild(categoryCell);
      row.appendChild(amountCell);
      expenseTableBody.appendChild(row);
    });
  }

  expenseTable.appendChild(expenseTableHead);
  expenseTable.appendChild(expenseTableBody);
  expenseContainer.appendChild(expenseTitle);
  expenseContainer.appendChild(expenseTable);

  // Create cash-out-container div
  const cashOutContainer = document.createElement('div');
  cashOutContainer.className = 'cash-out-container table-container';

  // Create h2 tag for cash out
  const cashOutTitle = document.createElement('h2');
  cashOutTitle.textContent = `Withdrawal of ${currentMonth}`;

  // Create table for cash out data
  const cashOutTable = createTable(monthData.cashOut);

  cashOutContainer.appendChild(cashOutTitle);
  cashOutContainer.appendChild(cashOutTable);


  // Append income-container and expense-container to total-income-expense-container
  totalIncomeExpenseContainer.appendChild(incomeContainer);
  totalIncomeExpenseContainer.appendChild(expenseContainer);
  totalIncomeExpenseContainer.appendChild(cashOutContainer);

  // Append monthly-analytics-container and total-income-expense-container to section

  section.appendChild(totalIncomeExpenseContainer);

  const chartContainer = document.createElement('div');
  chartContainer.classList.add('chartContainer');
  
  // Create container header
  const containerHeader = document.createElement('div');
  containerHeader.classList.add('container-header');
  containerHeader.textContent = 'Monthly Analytics'; // Set the header text here
  
  // Append container header to chartContainer
  chartContainer.appendChild(containerHeader);
  
  let canvas = createLineChart(monthData);
  chartContainer.appendChild(canvas);
  section.appendChild(chartContainer);
  

  return section;
}

function createLineChart(data) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'lineChart');

  const ctx = canvas.getContext('2d');
  
  const labels = [];
  const incomeData = [];
  const expenseData = [];
  
  data.income.forEach(item => {
      labels.push(new Date(item.timeStamp).toISOString().split('T')[0]);
      incomeData.push(item.amount);
  });

  data.expense.forEach(item => {
      expenseData.push(item.amount);
  });
  
  const lineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Income',
              borderColor: '#fff',
              data: incomeData,
              fill: false
          }, {
              label: 'Expense',
              borderColor: '#0fa',
              data: expenseData,
              fill: false
          }]
      },
      options: {
          scales: {
              x: {
                  type: 'time',
                  time: {unit: 'day'},
                  ticks: {color: '#fff'},
                  grid: {color: '#ffffff31'}
              },
              y: {
                  beginAtZero: true,
                  ticks: {color: '#fff'},
                  grid: {color: '#ffffff31'}
              }
          },
          plugins: {
              title: {
                display: true,
                text: 'Monthly Income Expense Chart',
                color: '#fff' // Set title text color to white
              }
          }
      }
  });
  
  return canvas;
}

//==============================================//

function createWalletSection(ID,data) {
  displayLoadingAnimation();
  // Create section element for Wallet
  const walletSection = document.createElement('section');
  walletSection.classList.add('wallet-section');

  const sectionTitle = 'Wallet';
  const sectionIcon = '<i class="fa fa-money"></i>';
  const subtitle = 'See where your balance is';
  const sectionHeader = createSectionHeader(sectionTitle, sectionIcon, subtitle);
  walletSection.appendChild(sectionHeader);

  // Create wallet container
  const walletContainer = document.createElement('div');
  walletContainer.classList.add('wallet-container');

  // Create method container
  const methodContainer = document.createElement('div');
  methodContainer.classList.add('method-container');

  // Create balance details container
  const balanceDetailsContainer = document.createElement('div');
  balanceDetailsContainer.classList.add('balance-details-container');

  if (data.length === 0) {
      const noDataMessage = document.createElement('p');
      noDataMessage.textContent = 'No balance data available.';
      balanceDetailsContainer.appendChild(noDataMessage);
      removeLoadingAnimation()
  }else{
      // Extract method names from data
      const walletMethods = data.map(item => item.method_name);
      // Create list of wallet methods
      const methodList = document.createElement('ul');
      walletMethods.forEach((method, index) => {
          const methodItem = document.createElement('li');
          methodItem.setAttribute('data-name',method);
          methodItem.textContent = method;
          methodItem.addEventListener('click', () => {
              // Remove 'active' class from all method items
              methodList.querySelectorAll('li').forEach(item => {
                  item.classList.remove('active');
              });
              // Add 'active' class to the clicked method item
              methodItem.classList.add('active');
              const balanceData = data.find(item => item.method_name === method);
              displayBalanceDetails(method,balanceData);
          });
          methodList.appendChild(methodItem);
          if (index === 0) {
              methodItem.click();
              methodItem.classList.add('active');
          }
      });
        // Append method list to method container
      methodContainer.appendChild(methodList);

      removeLoadingAnimation();
  }

  function displayBalanceDetails(method, balanceData) {
      // Clear previous content in balance details container
      let balanceCardDiv = document.querySelector('.balance-details-container');
      if (balanceCardDiv) {
          let balanceCard = balanceCardDiv.querySelector('.balance-card');
          if (balanceCard) {
              balanceCard.remove();
              
          }
      }

      // Create and append card with balance details
      const card = document.createElement('div');
      card.classList.add('balance-card', 'appear');
      card.innerHTML = `<h1>${method}</h1><img src='img/chip.png'><p class="acc-numb">${balanceData.account_number}</p><p class='balance'>$${balanceData.current_amount}</p>`;
      
      // Create delete button
      const deleteButton = document.createElement('span');
      deleteButton.classList.add('delete-button');
      deleteButton.setAttribute('title', 'Delete')
      deleteButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
      deleteButton.addEventListener('click', async () => {
          try {
              // Delete document from Firestore
              await deleteDoc(doc(db, "user", ID, "bank", method));
              const methodItem = document.querySelector(`.method-container ul li[data-name="${method}"]`);
              if (methodItem) {
                  methodItem.remove();
              }
              card.remove();
      
              // Check if there are no more cards remaining
              if (!document.querySelector('.card')) {
                  const noDataMessage = document.createElement('p');
                  noDataMessage.textContent = 'No bank details available.';
                  balanceDetailsContainer.appendChild(noDataMessage);
              }
      
              createModal("Success !!", "Bank details deleted successfully!");
          } catch (error) {
              console.error("Error deleting document:", error);
          }
      });
      
      card.appendChild(deleteButton);
      balanceDetailsContainer.appendChild(card);
      
  }

  // Append method container and balance details container to wallet container
  walletContainer.appendChild(methodContainer);
  walletContainer.appendChild(balanceDetailsContainer);

  // Append wallet container to wallet section
  walletSection.appendChild(walletContainer);

  // Append methodWise-income-expense-container 
  createMethodWiseIncomeExpenseContainer(ID).then(container => {
    walletSection.appendChild(container);
  });

  // Return wallet section
  return walletSection;
}

// Function to create the methodWise-income-expense-container
async function createMethodWiseIncomeExpenseContainer(userID) {
  const container = document.createElement('div');
  container.classList.add('methodWise-income-expense-container');

  // Get current month and year
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Create control-header
  const controlHeader = document.createElement('div');
  controlHeader.classList.add('control-header');

  // Create montWise-tables-container
  const montWiseTablesContainer = document.createElement('div');
  montWiseTablesContainer.classList.add('montWise-tables-container');

  function noMessage(){
    montWiseTablesContainer.innerHTML = "";
    const warningContainer = document.createElement('div');
    warningContainer.classList.add('warning-message-container');

    const h1 = document.createElement('h1');
    h1.innerHTML = 'No Data Found For This Month.';
    warningContainer.appendChild(h1);
    montWiseTablesContainer.appendChild(warningContainer);
  }
  // Function to generate month-wise tables container
  async function generateMonthWiseTables(monthData) {
    // Clear existing content of montWiseTablesContainer
    montWiseTablesContainer.innerHTML = '';

    // Create income table container
    const incomeTableContainer = document.createElement('div');
    incomeTableContainer.classList.add('table-container');
    const incomeTableHeader = document.createElement('h2');
    incomeTableHeader.textContent = 'Income';
    incomeTableContainer.appendChild(incomeTableHeader);
    incomeTableContainer.appendChild(await createTable(monthData.income));
    montWiseTablesContainer.appendChild(incomeTableContainer);

    // Create withdrawal table container
    const withdrawalTableContainer = document.createElement('div');
    withdrawalTableContainer.classList.add('table-container');
    const withdrawalTableHeader = document.createElement('h2');
    withdrawalTableHeader.textContent = 'Withdrawal';
    withdrawalTableContainer.appendChild(withdrawalTableHeader);
    withdrawalTableContainer.appendChild(await createTable(monthData.cashOut));
    montWiseTablesContainer.appendChild(withdrawalTableContainer);

    return montWiseTablesContainer;
  }

  // Create previous button
  const previousButton = document.createElement('button');
  previousButton.textContent = 'Previous';
  previousButton.addEventListener('click', async () => {
    currentMonth--; // Decrement current month
    if (currentMonth < 0) {
      currentMonth = 11; // Wrap around to December if current month becomes negative
      currentYear--; // Decrement year when wrapping around
    }
    const updatedDate = new Date(currentYear, currentMonth);
    monthYearDisplay.textContent = updatedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    displayLoadingAnimation();
    const docSnap = await getDoc(doc(db, "user",userID, currentYear.toString(), updatedDate.toLocaleString('default', { month: 'long' }) ));
    if (docSnap.exists()) {
      container.appendChild(await generateMonthWiseTables(docSnap.data()));
      removeLoadingAnimation();
    } else {
      noMessage();
      removeLoadingAnimation();
    }
  });

  controlHeader.appendChild(previousButton);

  // Create month and year display
  const monthYearDisplay = document.createElement('h2');
  monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  controlHeader.appendChild(monthYearDisplay);

  // Create next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', async () => {
    currentMonth++; // Increment current month
    if (currentMonth > 11) {
      currentMonth = 0; // Wrap around to January if current month exceeds 11 (December)
      currentYear++; // Increment year when wrapping around
    }
    const updatedDate = new Date(currentYear, currentMonth);
    monthYearDisplay.textContent = updatedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    displayLoadingAnimation();
    const docSnap = await getDoc(doc(db, "user",userID, currentYear.toString(), updatedDate.toLocaleString('default', { month: 'long' }) ));
    if (docSnap.exists()) {
      container.appendChild(await generateMonthWiseTables(docSnap.data()));
      removeLoadingAnimation();
    } else {
      noMessage();
      removeLoadingAnimation();
    }
  });

  controlHeader.appendChild(nextButton);

  container.appendChild(controlHeader);
  console.log(userID);
  
  const currentDate = new Date();
  const initialYear = currentDate.getFullYear().toString();
  const initialMonth = currentDate.toLocaleString('default', { month: 'long' });

  const docSnap = await getDoc(doc(db, "user",userID, initialYear, initialMonth));
  
  if (docSnap.exists()) {
    container.appendChild(await generateMonthWiseTables(docSnap.data()));
    removeLoadingAnimation();
  } else {
    noMessage();
    removeLoadingAnimation();
  }

  return container;
}

//======================================//
function createUpdateSection(userID) {
  // Create section element for Update
  const updateSection = document.createElement('section');
  updateSection.classList.add('update-container');

  const sectionTitle = 'Update';
  const sectionIcon = '<i class="fa fa-wrench"></i>';
  const subtitle = 'Update your income and expense';
  const sectionHeader = createSectionHeader(sectionTitle, sectionIcon, subtitle);
  updateSection.appendChild(sectionHeader);

  // Create input contents div
  const inputContents = document.createElement('div');
  inputContents.classList.add('input-contents');

  // Create input list container
  const inputListContainer = document.createElement('div');
  inputListContainer.classList.add('input-list-container');

  // Create form container
  const formContainer = document.createElement('div');
  formContainer.classList.add('form-container');

  // Array of form names
  const formNames = ['Income', 'Expense','Cash Out', 'Add Bank'];

  // Create list of form names
  const formList = document.createElement('ul');
  formNames.forEach((formName,index) => {
      const formItem = document.createElement('li');
      formItem.textContent = formName;
      formItem.addEventListener('click', () => {
          // Remove 'active' class from all form items
          formList.querySelectorAll('li').forEach(item => {
              item.classList.remove('active');
          });
          // Add 'active' class to the clicked form item
          formItem.classList.add('active');
          displayForm(formName,userID);
      });
      formList.appendChild(formItem);
      if(index === 0){
          formItem.click();
          formItem.classList.add('active');
      }
  });
  

  // Function to display form
 async function displayForm(formName,user) {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear().toString();
      // Clear previous content in form container
      formContainer.innerHTML = '';

      // Generate and display the desired form
      if (formName === 'Income') {
        displayLoadingAnimation();
        let bankOptions = [];
        const querySnapshot = await getDocs(collection(db, "user",user,'bank'));
        querySnapshot.forEach((doc) => {
          bankOptions.push(doc.data());
        });
        const methodNames = bankOptions.map(option => option.method_name);
        let selectOptions = methodNames.length > 0 ? methodNames : ['No methods available'];
        
        const inputDetails = [
            { type: 'select', label: 'Select Method', options: selectOptions },
            { type: 'number', label: 'Amount' }
        ];
          // Code to generate income form
        const heading = document.createElement('h1');
        heading.textContent = 'Income Form';
        // Append heading before the form
        formContainer.insertBefore(heading, formContainer.firstChild);
        // Code to generate income form
        const incomeForm = generateForm(inputDetails);
        formContainer.appendChild(incomeForm);

        removeLoadingAnimation();

        incomeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const incomeButton = incomeForm.querySelector('button[type="submit"]');
            incomeButton.disabled = true;
            incomeButton.innerHTML = '<i class="fa fa-spinner spin"></i>';

            const formData = new FormData(incomeForm);
            // Convert FormData to JSON object
            const formDataObject = {};
            // Check if any input value is empty
            let isEmpty = false;
            formData.forEach((value, key) => {
                if (!value.trim()) { // Check if the value is empty or contains only whitespace
                    isEmpty = true;
                    createModal("Warning", "Please fill in all fields");
                    incomeButton.disabled = false;
                    incomeButton.innerHTML = 'Submit';
                    return; // Exit the loop early if any input value is empty
                }
                formDataObject[key] = value;
            });

            formDataObject.timeStamp = new Date().toISOString();

            if (!isEmpty) {
              try {
                const currentMonthData = doc(db, "user", user, currentYear, currentMonth);
                const bankRef = doc(db, "user", user,"bank" ,formDataObject.select_method);
                // Get existing data (optional, for potential conflict handling)
                const docSnapshot = await getDoc(currentMonthData);
                let monthData = docSnapshot.exists ? docSnapshot.data() : {}; 
                // Append formDataObject to expense array
                monthData.income = monthData.income || []; 
                monthData.income.push(formDataObject);
                await updateDoc(currentMonthData, monthData);

                let bankData =  bankOptions.find(option => option.method_name === formDataObject.select_method);
                bankData.current_amount = parseAmount(bankData.current_amount) + parseAmount(formDataObject.amount);
                bankData.timeStamp = new Date().toISOString();
                await updateDoc(bankRef, bankData);

                createModal("Success !!","Income data saved successfully!"); 
                incomeButton.disabled = false;
                incomeButton.innerHTML = 'Submit';
              } catch (error) {
                console.error("Error saving income data:", error); // Log error message
              }
            }
            
        });

      } else if (formName === 'Expense') {
          const inputDetails = [
            {type: 'text',label: 'Name'},
            {type: 'select',label: 'Category',options: ['Tuition Fees','Books/Supplies','Housing/Rent','Food/Groceries','Transportation','Personal Care','Entertainment/Socializing','Miscellaneous']},
            {type: 'number',label: 'Amount',}];
          // Code to generate income form
          const heading = document.createElement('h1');
          heading.textContent = 'Expense Form';

          // Append heading before the form
          formContainer.insertBefore(heading, formContainer.firstChild);

          // Code to generate income form
          const expenseForm = generateForm(inputDetails);
          formContainer.appendChild(expenseForm);
          expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
        
            const expenseButton = expenseForm.querySelector('button[type="submit"]');
            expenseButton.disabled = true;
            expenseButton.innerHTML = '<i class="fa fa-spinner spin"></i>';
        
            const formData = new FormData(expenseForm);
            const formDataObject = {};
        
            let isEmpty = false;
            formData.forEach((value, key) => {
                if (!value.trim()) { 
                    isEmpty = true;
                }
                formDataObject[key] = value;
            });
        
            if (isEmpty) {
                createModal("Warning", "Please fill in all fields");
                expenseButton.disabled = false;
                expenseButton.innerHTML = 'Submit';
            } else {
                formDataObject.timeStamp = new Date().toISOString();
                try {
                    const currentMonthData = doc(db, "user", user, currentYear, currentMonth);
                    const docSnapshot = await getDoc(currentMonthData);
                    let monthData = docSnapshot.exists ? docSnapshot.data() : {};
                    monthData.expense = monthData.expense || [];
                    monthData.expense.push(formDataObject);
                    await updateDoc(currentMonthData, monthData);
                    createModal("Success !!","Expense data saved successfully!");
                } catch (error) {
                    console.error("Error saving expense data:", error);
                }
                expenseButton.disabled = false;
                expenseButton.innerHTML = 'Submit';
            }
        });        

      }else if (formName === 'Cash Out') {
        displayLoadingAnimation();
        let bankOptions = [];
        const querySnapshot = await getDocs(collection(db, "user",user,'bank'));
        querySnapshot.forEach((doc) => {
          bankOptions.push(doc.data());
        });
        const methodNames = bankOptions.map(option => option.method_name);
        let selectOptions = methodNames.length > 0 ? methodNames : ['No methods available'];
        
        const inputDetails = [
            { type: 'select', label: 'Select Method', options: selectOptions },
            { type: 'number', label: 'Amount' }
        ];
          // Code to generate income form
        const heading = document.createElement('h1');
        heading.textContent = 'Cash Out Form';
        // Append heading before the form
        formContainer.insertBefore(heading, formContainer.firstChild);
        // Code to generate income form
        const cashOutForm = generateForm(inputDetails);
        formContainer.appendChild(cashOutForm);

        removeLoadingAnimation();

        cashOutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cashOutButton = cashOutForm.querySelector('button[type="submit"]');
            cashOutButton.disabled = true;
            cashOutButton.innerHTML = '<i class="fa fa-spinner spin"></i>';

            const formData = new FormData(cashOutForm);
            // Convert FormData to JSON object
            const formDataObject = {};
            // Check if any input value is empty
            let isEmpty = false;
            formData.forEach((value, key) => {
                if (!value.trim()) { // Check if the value is empty or contains only whitespace
                    isEmpty = true;
                    createModal("Warning", "Please fill in all fields");
                    cashOutButton.disabled = false;
                    cashOutButton.innerHTML = 'Submit';
                    return; // Exit the loop early if any input value is empty
                }
                formDataObject[key] = value;
            });

            formDataObject.timeStamp = new Date().toISOString();

            if (!isEmpty) {
              try {
                const currentMonthData = doc(db, "user", user, currentYear, currentMonth);
                const bankRef = doc(db, "user", user,"bank" ,formDataObject.select_method);
                // Get existing data (optional, for potential conflict handling)
                const docSnapshot = await getDoc(currentMonthData);
                let monthData = docSnapshot.exists ? docSnapshot.data() : {}; 
                // Append formDataObject to expense array
                monthData.cashOut = monthData.cashOut || []; 
                monthData.cashOut.push(formDataObject);
                await updateDoc(currentMonthData, monthData);

                let bankData =  bankOptions.find(option => option.method_name === formDataObject.select_method);
                bankData.current_amount = parseAmount(bankData.current_amount) - parseAmount(formDataObject.amount);
                bankData.timeStamp = new Date().toISOString();
                await updateDoc(bankRef, bankData);

                createModal("Success !!","Cash Out data saved successfully!"); 
                cashOutButton.disabled = false;
                cashOutButton.innerHTML = 'Submit';
              } catch (error) {
                console.error("Error saving Cash Out data:", error); // Log error message
              }
            }
            
        });

      } else if (formName === 'Add Bank') {
        const inputDetails = [
          {type: 'text',label: 'Method Name'},
          {type: 'text',label: 'Account Number'},
          {type: 'number',label: 'Current Amount',}];
        // Code to generate income form
        const heading = document.createElement('h1');
        heading.textContent = 'Add Bank Details Form';

        // Append heading before the form
        formContainer.insertBefore(heading, formContainer.firstChild);

        // Code to generate income form
        const addBankForm = generateForm(inputDetails);
        formContainer.appendChild(addBankForm);
        addBankForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const addBankButton = addBankForm.querySelector('button[type="submit"]');
            addBankButton.disabled = true;
            addBankButton.innerHTML = '<i class="fa fa-spinner spin"></i>';
        
            const formData = new FormData(addBankForm);
            const formDataObject = {};
        
            let isEmpty = false;
            formData.forEach((value, key) => {
                if (!value.trim()) { 
                    isEmpty = true;
                }
                formDataObject[key] = value;
            });
        
            if (isEmpty) {
                createModal("Warning", "Please fill in all fields");
                addBankButton.disabled = false;
                addBankButton.innerHTML = 'Submit';
            } else {
                formDataObject.timeStamp = new Date().toISOString();
                try {
                    await setDoc(doc(db, "user", user, "bank", formDataObject.method_name), formDataObject);
                    createModal("Success !!","Bank data saved successfully!");
                } catch (error) {
                    console.error("Error saving bank data:", error);
                }
                addBankButton.disabled = false;
                addBankButton.innerHTML = 'Submit';
            }
        });
      
      } 
  }

  // Append form list to input list container
  inputListContainer.appendChild(formList);

  // Append input list container and form container to input contents
  inputContents.appendChild(inputListContainer);
  inputContents.appendChild(formContainer);

  // Append input contents to update section
  updateSection.appendChild(inputContents);

  // Return update section
  return updateSection;
}

function generateForm(inputDetailsArray, buttonText = "Submit") {
  const form = document.createElement('form');

  inputDetailsArray.forEach(inputDetails => {
      const formElement = generateFormElement(inputDetails);
      form.appendChild(formElement);
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = buttonText || "Submit";
  form.appendChild(submitBtn);

  return form;
}

function generateFormElement(inputDetails) {
  const { type, label, options } = inputDetails;
  const formElement = document.createElement('div');
  formElement.classList.add('input-group');

  if (type === 'text' || type === 'number' || type === "email" || type === "password") {
      const inputField = document.createElement('input');
      inputField.setAttribute('type', type);
      inputField.setAttribute('name', label.toLowerCase().replace(/\s/g, '_'));
      if (type === 'number') {
          inputField.setAttribute('min', 0);
      }
      formElement.appendChild(inputField);
  } else if (type === 'select' && options && options.length > 0) {
      const selectField = document.createElement('select');
      selectField.setAttribute('name', label.toLowerCase().replace(/\s/g, '_'));
      options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.textContent = option;
          selectField.appendChild(optionElement);
      });
      formElement.appendChild(selectField);
  }else if (type === 'datetime-local') {
    const datetimeField = document.createElement('input');
    datetimeField.setAttribute('type', 'datetime-local');
    datetimeField.setAttribute('name', label.toLowerCase().replace(/\s/g, '_'));
    formElement.appendChild(datetimeField);
  }else if (type === 'textarea') {
    const textareaField = document.createElement('textarea');
    textareaField.setAttribute('name', label.toLowerCase().replace(/\s/g, '_'));
    formElement.appendChild(textareaField);
  }

  if (label) {
      const labelElement = document.createElement('label');
      labelElement.textContent = label;
      formElement.insertBefore(labelElement, formElement.firstChild);
  }

  return formElement;
}
//===========================================//
function noTaskMessage(){
  // Create container element
  const noTaskContainer = document.createElement('div');
  noTaskContainer.classList.add('no-task-container');
  const noTaskTitle = document.createElement('h2');
  noTaskTitle.textContent = 'No Task Available';
  // Append h2 element to container
  noTaskContainer.appendChild(noTaskTitle);

  return noTaskContainer
}

function createToDoSection(userID,taskManager){
  // Create section element for Update
  const toDoSection = document.createElement('section');
  toDoSection.classList.add('toDo-container');

  const sectionTitle = 'To Do';
  const sectionIcon = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
  const subtitle = 'Assign task to do';
  const sectionHeader = createSectionHeader(sectionTitle, sectionIcon, subtitle);
  toDoSection.appendChild(sectionHeader);

  // Create tasks content container
  const tasksContent = document.createElement('div');
  tasksContent.classList.add('tasks-content');
  // Create action tasks container
  const actionTasksContainer = document.createElement('div');
  actionTasksContainer.classList.add('action-tasks-container');

  // Create div for today's tasks
  const todaysTaskContainer = document.createElement('div');
  todaysTaskContainer.classList.add('todaysTask-container');
  const todaysTaskTitle = document.createElement('h2');
  todaysTaskTitle.textContent = "Today's Tasks";
  todaysTaskContainer.appendChild(todaysTaskTitle);
  // Create tasks container for today's tasks
  const todaysTasksContainer = document.createElement('div');
  todaysTasksContainer.classList.add('tasks-container');
  // Generate task card for today's tasks
  const currentDate = new Date().toLocaleDateString('en-US');

  // Filter tasks matching the current date excluding 'Completed' tasks
  const tasksForToday = taskManager.filter(task => {
    const taskDueDate = new Date(task.date).toLocaleDateString('en-US');
    return taskDueDate === currentDate && task.set_status !== 'Completed';
  });

  // Iterate over filtered tasks and generate task cards
  if(tasksForToday.length === 0){
    todaysTasksContainer.appendChild(noTaskMessage());
  }else{
    tasksForToday.forEach(task => {
      let taskCard = generateTaskCard(userID,task);
      todaysTasksContainer.appendChild(taskCard);
    });
  }
  // Append today's tasks container to today's task container
  todaysTaskContainer.appendChild(todaysTasksContainer);

  // Create div for previous tasks
  const previousTasksContainer = document.createElement('div');
  previousTasksContainer.classList.add('previous-tasks-container');
  const previousTaskTitle = document.createElement('h2');
  previousTaskTitle.textContent = "Previous Tasks";
  previousTasksContainer.appendChild(previousTaskTitle);

  // Filter tasks that are before the current date (without considering time)
  const previousTasks = taskManager.filter(task => {
    // Get the due date without time
    const taskDueDate = new Date(task.date);
    const currentDate = new Date();
    const taskDueDateWithoutTime = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
    const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Include tasks with status "Completed" or due date before the current date
    return task.set_status === 'Completed' || taskDueDateWithoutTime < currentDateWithoutTime;
  });

  // Create tasks container for previous tasks
  const previousTasksContent = document.createElement('div');
  previousTasksContent.classList.add('tasks-container');
  // Iterate over filtered previous tasks and generate task cards
  if (previousTasks.length === 0) {
    // If there are no previous tasks, append the noTaskContainer
      previousTasksContent.appendChild(noTaskMessage());
  }else{
    previousTasks.forEach(task => {
      let taskCard = generateTaskCard(userID,task);
      previousTasksContent.appendChild(taskCard);
    });
  }
  // Append previous tasks content to previous tasks container
  previousTasksContainer.appendChild(previousTasksContent);

  // Append today's task container to tasks content container
  actionTasksContainer.appendChild(todaysTaskContainer);
  actionTasksContainer.appendChild(previousTasksContainer);
  tasksContent.appendChild(actionTasksContainer);
  //-------------------------------------------------//
  // Create div for upcoming tasks
  const upcomingTaskContainer = document.createElement('div');
  upcomingTaskContainer.classList.add('upcoming-task-container');
  const upcomingTaskTitle = document.createElement('h2');
  upcomingTaskTitle.textContent = "Upcoming Tasks";
  upcomingTaskContainer.appendChild(upcomingTaskTitle);

    // Create tasks container for today's tasks
  const upcomingContainer = document.createElement('div');
  upcomingContainer.classList.add('tasks-container');

  // Generate task card for today's tasks
  // Filter tasks for upcoming tasks (excluding tasks with status 'Completed')
  const upcomingTasks = taskManager.filter(task => {
  // Get the due date without time
  const taskDueDate = new Date(task.date);
  const currentDate = new Date();
  const taskDueDateWithoutTime = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
  const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  // Exclude tasks with status 'Completed' and filter out tasks after today's date
  return task.set_status !== 'Completed' && taskDueDateWithoutTime > currentDateWithoutTime;
  });



  // Iterate over filtered upcoming tasks and generate task cards
  if(upcomingTasks.length === 0){
    upcomingContainer.appendChild(noTaskMessage());
  }else{
    upcomingTasks.forEach(task => {
      let taskCard = generateTaskCard(userID,task);
      upcomingContainer.appendChild(taskCard);
    });
  }


  // Append today's tasks container to today's task container
  upcomingTaskContainer.appendChild(upcomingContainer);

  // Append upcoming task container to tasks content container
  tasksContent.appendChild(upcomingTaskContainer);

  // Append tasks content container to the toDoSection
  toDoSection.appendChild(tasksContent);
  //----------------------------------//
  // Create new task container
  const newTaskContainer = document.createElement('div');
  newTaskContainer.classList.add('new-task-container');
  newTaskContainer.setAttribute('toggle-name','New Task');
  // Create span element with plus icon
  const plusIconSpan = document.createElement('span');
  plusIconSpan.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';

  // Append plus icon span to new task container
  newTaskContainer.appendChild(plusIconSpan);
  // Attach click event listener to the newTaskContainer
  newTaskContainer.addEventListener('click', () => {
    openTaskModal(userID)
  });

  // Append new task container to the toDoSection
  toDoSection.appendChild(newTaskContainer);

  return toDoSection;
}

function generateTaskCard(user,task) {
  // Create task card container
  const taskCard = document.createElement('div');
  taskCard.classList.add('task-card');

  // Create task card header
  const header = document.createElement('div');
  header.classList.add('header');

  // Create header title containing title and formatted date
  const headerTitle = document.createElement('div');
  headerTitle.classList.add('header-title');
  const formattedDate = new Date(task.date).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'long', day: 'numeric', year: 'numeric' });
  headerTitle.innerHTML = `<h3>${task.name}</h3><p>${formattedDate}</p>`;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
  closeButton.classList.add('close-btn');
  closeButton.addEventListener('click',async () => {
    await deleteDoc(doc(db, "user", user, 'Tasks',task.id));  
    taskCard.remove(); 
    createModal('Deleted','Task has been deleted successfully.');
  });

  // Append header title and close button to header
  header.appendChild(headerTitle);
  header.appendChild(closeButton);

  // Create task card body
  const body = document.createElement('div');
  body.classList.add('body');
  body.innerHTML = `<p>${task.describe}</p>`;

  // Create task card footer
  const footer = document.createElement('div');
  footer.classList.add('footer');

  // Create status container containing status icon and status text
  const statusContainer = document.createElement('div');
  statusContainer.classList.add('status-container');
  const statusIcon = document.createElement('span');
  statusIcon.innerHTML = '<i class="fa fa-check"></i>'; // You can replace it with the appropriate icon based on status
  const statusText = document.createElement('p');
  statusText.textContent = task.set_status;
  statusContainer.appendChild(statusIcon);
  statusContainer.appendChild(statusText);
  if(task.lastUpdate){
    statusContainer.setAttribute('data-update', `Updated:${formatTimeStamp(task.lastUpdate)}`);
  }else{
    statusContainer.setAttribute('data-update', `Not Updated Yet`);
  }

  // Create button container containing task action button
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  const actionButton = document.createElement('button');
  // Add event listener to the action button
  actionButton.addEventListener('click', async () => {
    if (actionButton.innerHTML !== 'Delete') {
        actionButton.disabled = true;
        actionButton.innerHTML = '<i class="fa fa-spinner spin"></i>';
        
        const currentTimestamp = new Date().toISOString();
        task.lastUpdate = currentTimestamp;
        task.set_status = 'Completed';
        console.log(task);

        try {
            const updateRef = doc(db, "user", user, 'Tasks', task.id);
            await updateDoc(updateRef, task);
            
            setTimeout(() => {
                actionButton.innerHTML = 'Delete';
                actionButton.disabled = false;
                statusText.textContent = task.set_status;

                const taskCardClone = taskCard.cloneNode(true);
                taskCard.remove();

                const previousContainer = document.querySelector('.previous-tasks-container .tasks-container');
                const todayTasksContainer = document.querySelector('.todaysTask-container .tasks-container');
                const upcomingTasksContainer = document.querySelector('.upcoming-task-container .tasks-container');
                if (upcomingTasksContainer.children.length === 0) {
                    upcomingTasksContainer.appendChild(noTaskMessage());
                }else if(todayTasksContainer.children.length === 0){
                  todayTasksContainer.appendChild(noTaskMessage());
                }else if(previousContainer.children.length === 0){
                  previousContainer.appendChild(noTaskMessage());
                }
                // Add event listener to the action button of the cloned task card
                taskCardClone.querySelector('.button-container button').addEventListener('click', async () => {
                  try {
                    const updateRef = doc(db, "user", user, 'Tasks', task.id);
                    await deleteDoc(updateRef);
                    createModal('Deleted', 'Task has been deleted successfully.');
                    taskCardClone.remove();
                    if(previousContainer.children.length === 0){
                      previousContainer.appendChild(noTaskMessage())
                    }
                  } catch (error) {
                      console.error("Error writing document: ", error);
                  }
                });
                const noTaskContainer = previousContainer.querySelector('.no-task-container');
                if (noTaskContainer) {
                    previousContainer.removeChild(noTaskContainer); // Remove the "no-task-container" element if present
                }
                previousContainer.appendChild(taskCardClone);
            }, 500);
        } catch (error) {
            console.error("Error writing document: ", error);
        }
    }else{
      try {
        const updateRef = doc(db, "user", user, 'Tasks', task.id);
        await deleteDoc(updateRef);
        createModal('Deleted', 'Task has been deleted successfully.');
        taskCard.remove();
      } catch (error) {
          console.error("Error writing document: ", error);
      }
    }
  });


  // Decide button text based on status
  switch (task.set_status) {
    case 'Pending':
      actionButton.textContent = 'Mark as Completed';
      break;
    case 'Completed':
      actionButton.textContent = 'Delete';
      break;
    default:
      actionButton.textContent = 'Mark as Completed';
  }

  buttonContainer.appendChild(actionButton);

  // Append status container and button container to footer
  footer.appendChild(statusContainer);
  footer.appendChild(buttonContainer);

  // Append header, body, and footer to task card
  taskCard.appendChild(header);
  taskCard.appendChild(body);
  taskCard.appendChild(footer);

  // Return the generated task card
  return taskCard;
}

// Function to create and display the modal with the task form
function openTaskModal(userID) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal-container');

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.classList.add('modal-header');

  // Create modal title
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'New Task';
  modalTitle.classList.add('modal-title');

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
  closeButton.classList.add('close-btn');
  closeButton.addEventListener('click', () => {
      modalContainer.remove(); // Remove the modal from the DOM
  });

  // Append modal title and close button to modal header
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);

  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body','task-body');

  // Create form elements
  const inputDetails = [
    { type: 'text', label: 'Name' },
    { type: 'select', label: 'Set Status', options: ['Pending','Completed'] },
    { type: 'datetime-local', label: 'Date' },
    { type: 'textarea', label: 'Describe' }
  ];
  const newTaskForm = generateForm(inputDetails);
  modalBody.appendChild(newTaskForm);
  newTaskForm.addEventListener('submit',async (e) => {
    e.preventDefault();
    const newTaskBtn = newTaskForm.querySelector('button[type="submit"]');
    newTaskBtn.disabled = true;
    newTaskBtn.innerHTML = '<i class="fa fa-spinner spin"></i>';
    const formData = new FormData(newTaskForm);

    // Convert FormData object to JSON
    const formDataJSON = {};
    let isEmpty = false;
    formData.forEach((value, key) => {
        if (!value.trim()) { // Check if the value is empty or contains only whitespace
            isEmpty = true;
            createModal("Warning", "Please fill in all fields");
            newTaskBtn.disabled = false;
            newTaskBtn.innerHTML = 'Submit';
            return; // Exit the loop early if any input value is empty
        }
        formDataJSON[key] = value;
    });
    // Log the form data
    console.log(formDataJSON);
    try {
      const docRef = await addDoc(collection(db, "user",userID,'Tasks'), formDataJSON);
        console.log("Document successfully written!",docRef.id);

        formDataJSON.id = docRef.id;
        let newCard = generateTaskCard(userID, formDataJSON);
        const previousContainer = document.querySelector('.previous-tasks-container .tasks-container');
        const todayTasksContainer = document.querySelector('.todaysTask-container .tasks-container');
        const upcomingTasksContainer = document.querySelector('.upcoming-task-container .tasks-container');
        // Remove any existing no-task-container
        document.querySelectorAll('.no-task-container').forEach(container => {
          container.parentNode.removeChild(container);
        });

        // Get the date from formDataJSON and remove the time component
        const taskDate = new Date(formDataJSON.date);
        taskDate.setHours(0, 0, 0, 0);

        // Get the current date and remove the time component
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if taskDate is prior to the current date
        if (taskDate < currentDate) {
            previousContainer.appendChild(newCard);
        } else if (taskDate > currentDate) { // Check if taskDate is after the current date
            upcomingTasksContainer.appendChild(newCard);
        } else { // Task date is equal to the current date
            todayTasksContainer.appendChild(newCard);
        }
        
        modalContainer.remove();
        createModal('Success !!', 'New task added successfully.');
    } catch (error) {
        console.error("Error writing document: ", error);
    }

  })

  // Append modal header and modal body to modal content
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);

  // Append modal content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to the body
  document.body.appendChild(modalContainer);
}

//===========================================//
function createModal(title, content) {
  // Check if a modal with the same title already exists
  if (document.querySelector(`.modal-title[data-title="${title}"]`)) {
      return; // Exit function if modal already exists
  }

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal-container');

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.classList.add('modal-header');

  // Create modal title
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = title;
  modalTitle.classList.add('modal-title');
  modalTitle.dataset.title = title; // Set data-title attribute to title

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
  closeButton.classList.add('close-btn');
  closeButton.addEventListener('click', () => {
      modalContainer.remove(); // Remove the modal from the DOM
  });

  // Append modal title and close button to modal header
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);

  // Create modal body
  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');

  // Check if content type is object and has newMonth set to true
  if (typeof content === 'object' && content.newMonth === true) {
      const message = document.createElement('p');
      message.innerHTML = content.message;

      // Create "Start New Month" button
      const startNewMonthButton = document.createElement('button');
      startNewMonthButton.textContent = "Start New Month";
      startNewMonthButton.addEventListener('click', () => {
          startNewMonth(content.user);
          modalContainer.remove(); // Remove the modal from the DOM after starting new month
      });

      // Append message and button to modal body
      modalBody.appendChild(message);
      modalBody.appendChild(startNewMonthButton);
  } else {
      // If content is not an object or newMonth is not true, treat content as HTML
      modalBody.innerHTML = content;
  }

  // Append modal header and modal body to modal content
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);

  // Append modal content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to the body
  document.body.appendChild(modalContainer);
}
//=================================//
function startNewMonth(userID){
  displayLoadingAnimation();

  // Get current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  // Create references for empty paths
  const newMonthRef = doc(db, "user", userID, currentYear, currentMonth);
  // Create empty objects (optional for clarity)
  const newMonthData = {
    income: [],
    expense: [],
    cashOut: [],
    month: currentMonth
  };
  try{
    setDoc(newMonthRef, newMonthData);
    // console.log("Empty paths created  successfully!");
    removeLoadingAnimation();
    createModal("Success !!","Congratulations! Your new month has started. Make it count with fresh goals and renewed determination towards success!");
    createPrimaryElements(userID);
  }catch (error) {
    console.error("Error adding document: ", error);
    createModal('Failed !!', 'Something Went Wrong. Please Try Again.');
    removeLoadingAnimation();
  }
  
}

//====================================//
function displayLoadingAnimation() {
  // Create loading container
  const loadingContainer = document.createElement('div');
  loadingContainer.classList.add('loading-container');

  // Create loading animation
  const loadingAnimation = document.createElement('div');
  loadingAnimation.classList.add('loader');

  // Append loading animation to loading container
  loadingContainer.appendChild(loadingAnimation);

  // Append loading container to the body
  document.body.appendChild(loadingContainer);

  return loadingContainer; // Return the loading container reference
}

function removeLoadingAnimation() {
  // Select the loading container
  const loadingContainer = document.querySelector('.loading-container');

  // Check if loading container exists
  if (loadingContainer && loadingContainer.parentNode) {
      // Remove loading container from the DOM
      loadingContainer.parentNode.removeChild(loadingContainer);
  }
}
//==================================//
function formatTimeStamp(timestamp) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'long',
      day: 'numeric',
      year: 'numeric'
  });
  return formattedDate;
}