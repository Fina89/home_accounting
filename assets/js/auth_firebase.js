const signInBtn = document.querySelector('#auth-sign-in')
const logoutBtn = document.querySelector('#auth-logout')
const signUpBtn = document.querySelector('#auth-sign-up')
const userInfo = document.querySelector('#auth-user-info')
const authControls = document.querySelector('#auth-controls')

function initSignUp(signUpForm) {
    signUpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        let emailField = this.querySelector('#signup-email');
        let passwordField = this.querySelector('#signup-password');
        let passwordConfirmField = this.querySelector('#signup-password-confirm');

        let emailInvalid = this.querySelector('#signup-email-invalid');
        let passwordInvalid = this.querySelector('#signup-password-invalid');
        let passwordConfirmInvalid = this.querySelector('#signup-password-confirm-invalid');

        let email = emailField.value;
        let password = passwordField.value;
        let passwordConfirm = passwordConfirmField.value;

        if (password !== passwordConfirm) {
            passwordConfirmField.classList.add('is-invalid')
            passwordConfirmInvalid.innerHTML = 'Passwords do not match!'
            return
        };
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                user = userCredential.user;
                userInfo.innerHTML = user.email
                userInfo.classList.remove('hidden')
                logoutBtn.classList.remove('hidden')
                signInBtn.classList.add('hidden')
                signUpBtn.classList.add('hidden')
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                if (errorCode.includes('email')) {
                    showError(emailField, emailInvalid, errorMessage)
                } else if (errorCode.includes('password')) {
                    showError(passwordField, passwordInvalid, errorMessage)
                } else {
                    console.log(errorCode);
                    console.log(errorMessage);
                }
            });
    })
}

function initSignIn(signInForm) {
    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();

        let emailField = this.querySelector('#signin-email');
        let passwordField = this.querySelector('#signin-password');

        let emailInvalid = this.querySelector('#signin-email-invalid');
        let passwordInvalid = this.querySelector('#signin-password-invalid');

        let email = emailField.value;
        let password = passwordField.value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                user = userCredential.user;
                userInfo.innerHTML = user.email
                userInfo.classList.remove('hidden')
                logoutBtn.classList.remove('hidden')
                signInBtn.classList.add('hidden')
                signUpBtn.classList.add('hidden')
            })
            .catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                if (errorCode.includes('email') || errorCode.includes('user')) {
                    showError(emailField, emailInvalid, errorMessage)
                } else if (errorCode.includes('password')) {
                    showError(passwordField, passwordInvalid, errorMessage)
                } else {
                    console.log(errorCode);
                    console.log(errorMessage);
                }
            });
    })
}

firebase.auth().onAuthStateChanged(function(currentUser) {
    if (currentUser) {
        user = currentUser
        // userInfo.innerHTML = user.email
        // userInfo.classList.remove('hidden')
        // logoutBtn.classList.remove('hidden')
        // signInBtn.classList.add('hidden')
        // signUpBtn.classList.add('hidden')
    } else {
        user = null;
        // userInfo.innerHTML = ''
        // userInfo.classList.add('hidden')
        // logoutBtn.classList.add('hidden')
        // signInBtn.classList.remove('hidden')
        // signUpBtn.classList.remove('hidden')
    }
});

function initLogout(logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        firebase.auth().signOut()
            .then(() => {
                user = null;
                userInfo.innerHTML = ''
                userInfo.classList.add('hidden')
                logoutBtn.classList.add('hidden')
                signInBtn.classList.remove('hidden')
                signUpBtn.classList.remove('hidden')
            })
    })
}