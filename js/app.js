import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore,doc,getDoc,getDocs, setDoc,collection, addDoc,updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth,signOut ,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
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

// signOut(auth).then(() => {
//   console.log('sign out !!')
// }).catch((error) => {
  
// });

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log(uid);
    createPrimaryElements(uid);
  } else {
    console.log('sign out !!');
    createCredentialSection();
  }
});


//=====================================//
function createCredentialSection(){
  // Create main container section
  const credentialContainer = document.createElement('section');
  credentialContainer.classList.add('credential-container');

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
              console.log(user.uid);
              createModal("Welcome Back !!",`<h3>Hi, ${emailInput.value}</h3><p>Welcome back! You have successfully logged in. Enjoy your browsing experience!</p>`)
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
              console.log(user.uid);
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
                month: currentMonth
              };
              try{
                setDoc(yearMonthRef, yearMonthData),
                console.log("Empty paths created and user registered successfully!");
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
  credentialContainer.appendChild(tabsContainer);
  credentialContainer.appendChild(loginFormContainer);
  credentialContainer.appendChild(registerFormContainer);

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
async function createPrimaryElements(userID) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

  // const docRef = doc(db, "user", "test", currentYear, currentMonth);
  // try {
  //   const docSnapshot = await getDoc(docRef);
  //   if (docSnapshot.exists()) {
  //     console.log("Location data is available for", currentMonth, currentYear);
  //   } else {
  //     console.log("Location data is not available for", currentMonth, currentYear);
  //   }
  // } catch (error) {
  //   console.error("Error checking for location data:", error);
  // }

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
            const docSnap = await getDoc(doc(db, "user", userID, currentYear, currentMonth));

            if (docSnap.exists()) {
              const homeSection = createHomeSection(docSnap.data());
              mainContainer.innerHTML = "";
              mainContainer.appendChild(homeSection);
            } else {
              // docSnap.data() will be undefined in this case
              createModal("Warning !!","No such document!");
            }
            
          }else if(item.name == 'Wallet'){
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
      
      toggleContainer.addEventListener('click', () => {
          if (isNavOpen) {
              navContainer.style.transform = 'translateX(-45px)';
              toggleSpan.style.transform = 'rotate(0deg)';
          } else {
              navContainer.style.transform = 'translateX(0px)';
              toggleSpan.style.transform = 'rotate(180deg)';
          }
          isNavOpen = !isNavOpen; // Toggle the state
      });
  }
};
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
//=========================================//
function createHomeSection(monthData) {
    // Create section element
    const section = document.createElement('section');
    section.id = 'home';

    const sectionTitle = 'Dashboard';
    const sectionIcon = '<i class="fa fa-tachometer" aria-hidden="true"></i>';
    const subtitle = 'Analyze your incomes and expenses';
    const sectionHeader = createSectionHeader(sectionTitle, sectionIcon, subtitle);
    // Append sectionHeader to wherever you need it in your document
    section.appendChild(sectionHeader);

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
    incomeContainer.className = 'income-container';

    // Create h2 tag for income
    const incomeTitle = document.createElement('h2');
    incomeTitle.textContent = `Income of ${currentMonth}`;

    // Create table for income data
    const incomeTable = document.createElement('table');
    const incomeTableHead = document.createElement('thead');
    const incomeTableBody = document.createElement('tbody');

    // Create table headers for income table
    const incomeTableHeaders = ['Time', 'Method', 'Amount'];
    const incomeTableHeadRow = document.createElement('tr');
    incomeTableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        incomeTableHeadRow.appendChild(th);
    });
    incomeTableHead.appendChild(incomeTableHeadRow);

    // Populate income data into table
    monthData.income.forEach(income => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = income.timeStamp;
        const methodCell = document.createElement('td');
        methodCell.textContent = income.select_method;
        const amountCell = document.createElement('td');
        amountCell.textContent = income.amount;
        row.appendChild(timeCell);
        row.appendChild(methodCell);
        row.appendChild(amountCell);
        incomeTableBody.appendChild(row);
    });

    incomeTable.appendChild(incomeTableHead);
    incomeTable.appendChild(incomeTableBody);
    incomeContainer.appendChild(incomeTitle);
    incomeContainer.appendChild(incomeTable);

    // Create expense-container div
    const expenseContainer = document.createElement('div');
    expenseContainer.className = 'expense-container';

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
    monthData.expense.forEach(expense => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = expense.timeStamp;
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

    expenseTable.appendChild(expenseTableHead);
    expenseTable.appendChild(expenseTableBody);
    expenseContainer.appendChild(expenseTitle);
    expenseContainer.appendChild(expenseTable);

    // Append income-container and expense-container to total-income-expense-container
    totalIncomeExpenseContainer.appendChild(incomeContainer);
    totalIncomeExpenseContainer.appendChild(expenseContainer);

    // Append monthly-analytics-container and total-income-expense-container to section

    section.appendChild(totalIncomeExpenseContainer);

    const chartContainer = document.createElement('div');
    chartContainer.classList.add('chartContainer');

    // let canvas = createLineChart(monthData);
    // chartContainer.appendChild(canvas);
    // section.appendChild(chartContainer);

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
              borderColor: '#ofa',
              data: expenseData,
              fill: false
          }]
      },
      options: {
          scales: {
              x: {
                  type: 'time',
                  time: {
                      unit: 'day'
                  }
              },
              y: {
                  beginAtZero: true
              }
          },
          title: {
            display: true,
            text: 'Monthly Income Expense Chart'
          }
      }
  });
  
  return canvas;
}
//==============================================//

function createWalletSection(ID,data) {
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
      deleteButton.setAttribute('title','Delete')
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
            createModal("Success !!", "Bank details deleted successfully!");
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    });
    
      card.appendChild(deleteButton);

      balanceDetailsContainer.appendChild(card);
  }


  // Append method list to method container
  methodContainer.appendChild(methodList);

  // Append method container and balance details container to wallet container
  walletContainer.appendChild(methodContainer);
  walletContainer.appendChild(balanceDetailsContainer);

  // Append wallet container to wallet section
  walletSection.appendChild(walletContainer);

  // Return wallet section
  return walletSection;
}

//======================================//
function createUpdateSection(userID) {
  // Create section element for Update
  const updateSection = document.createElement('section');
  updateSection.classList.add('update-container');

  const sectionTitle = 'Update';
  const sectionIcon = '<i class="fa fa-wrench"></i>';
  const subtitle = 'See where your balance is';
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
  const formNames = ['Income', 'Expense', 'Add Bank'];

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
  function displayForm(formName,user) {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear().toString();
      // Clear previous content in form container
      formContainer.innerHTML = '';

      // Generate and display the desired form
      if (formName === 'Income') {
        const inputDetails = [
            {type: 'select',label: 'Select Method',options: ['Bkash', 'Nagad', 'Rocket','Bank']},
            {type: 'number',label: 'Amount',}];
          // Code to generate income form
        const heading = document.createElement('h1');
        heading.textContent = 'Income Form';

        // Append heading before the form
        formContainer.insertBefore(heading, formContainer.firstChild);

        // Code to generate income form
        const incomeForm = generateForm(inputDetails);
        formContainer.appendChild(incomeForm);
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
  
                  // Get existing data (optional, for potential conflict handling)
                  const docSnapshot = await getDoc(currentMonthData);
                  let monthData = docSnapshot.exists ? docSnapshot.data() : {}; 
              
                  // Append formDataObject to expense array
                  monthData.income = monthData.income || []; 
                  monthData.income.push(formDataObject);
              
                  await updateDoc(currentMonthData, monthData);
                  createModal("Success !!","income data saved successfully!"); 
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
            {type: 'text',label: 'Category'},
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
  }

  if (label) {
      const labelElement = document.createElement('label');
      labelElement.textContent = label;
      formElement.insertBefore(labelElement, formElement.firstChild);
  }

  return formElement;
}
//===========================================//
function createModal(title, content) {
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
  modalBody.innerHTML = content;

  // Append modal header and modal body to modal content
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);

  // Append modal content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to the body
  document.body.appendChild(modalContainer);
}

// Example usage:
// const modalTitle = 'Modal Title';
// const modalContent = 'This is the modal content.';
// createModal(modalTitle, modalContent);
