// форму авторизации пришлось сделать через класс, т,к, по-другому не полчилось


const SignInForm = {
    id: 'signInForm',
    action: 'Войти',
    fields: {
        email: 'email',
        password: 'password'
    },
    init: function() {
        const form = document.querySelector('#' + this.id);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit(form);
        })
    },
    submit: function(form) {
        const email = form.querySelector(`#${this.id}-${this.fields.email}`);
        const password = form.querySelector(`#${this.id}-${this.fields.password}`);
        blockForm(this); //блочим форму авторизации, что б нервный пользователь не жмякал кнопку, инпуты
        firebase.auth().signInWithEmailAndPassword(email.value, password.value) //обрабатывает файербэйз логин и пароль
            .then((userCredential) => { // прилетает ответ
                // Signed in
                unblockForm(this) //разблокируем форму
                window.dispatchEvent(formEvent) // запускаю свое собственносозданное событие, от которого закроется модальное окно
            })
            .catch((error) => { //если прилетела ошибка
                showError(form, error.message) //вызываем метод обработки ошибки
                unblockForm(this) //разблокируем форму
            });
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <form id="${this.id}">
            <div class="error"></div>
            <label for="${this.id}-${this.fields.email}" class="visually-hidden">Email address</label>
            <input type="email" class="form-control" id="${this.id}-${this.fields.email}" placeholder="Электронная почта" required="" autofocus="">
            <label for="${this.id}-${this.fields.password}" class="visually-hidden">Password</label>
            <input type="password" class="form-control" id="${this.id}-${this.fields.password}" placeholder="Пароль" required="">
            <button class="w-100 btn btn-lg btn-primary" type="submit" id="${this.id}-btn">${this.action}</button>
        </form>
        `;
        return html;
    }
}

const SignUpForm = {
    id: 'signUpForm',
    action: 'Зарегистрироваться',
    fields: {
        email: 'email',
        password: 'password',
        confirmPassword: 'confirmPassword'
    },
    init: function() {
        const form = document.querySelector('#' + this.id);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit(form);
        })
    },
    submit: function(form) {
        blockForm(this); //блочим форму авторизации, что б нервный пользователь не жмякал кнопку, инпуты
        const email = form.querySelector(`#${this.id}-${this.fields.email}`);
        const password = form.querySelector(`#${this.id}-${this.fields.password}`);
        const confirmPassword = form.querySelector(`#${this.id}-${this.fields.confirmPassword}`);
        if (password.value !== confirmPassword.value) {
            const errorMessage = 'Пароли не совпадают' //совпадение пароля
            showError(form, errorMessage)
            unblockForm(this);
            return
        };
        firebase.auth().createUserWithEmailAndPassword(email.value, password.value) //обрабатывает файербэйз логин и пароль
            .then((userCredential) => { // прилетает ответ
                // Signed up
                unblockForm(this) //разблокируем форму
                window.dispatchEvent(formEvent)
            })
            .catch((error) => { //если прилетела ошибка
                showError(form, error.message) //вызываем метод обработки ошибки
                unblockForm(this) //разблокируем форму
            });
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <form id="${this.id}">
            <div class="error"></div>
            <label for="${this.id}-${this.fields.email}" class="visually-hidden">Email address</label>
            <input type="email" class="form-control" id="${this.id}-${this.fields.email}" placeholder="Электронная почта" required="" autofocus="">
            <label for="${this.id}-${this.fields.password}" class="visually-hidden">Password</label>
            <input type="password" class="form-control" id="${this.id}-${this.fields.password}" placeholder="Пароль" required="">
            <label for="${this.id}-${this.fields.confirmPassword}" class="visually-hidden">Confirm password</label>
            <input type="password" class="form-control" id="${this.id}-${this.fields.confirmPassword}" placeholder="Повторите пароль" required="">
            <button class="w-100 btn btn-lg btn-primary" type="submit" id="${this.id}-btn">${this.action}</button>
        </form>
        `;
        return html;
    }
}

const AddCategoryForm = {
    id: 'addCategoryForm',
    action: 'Добавить категорию',
    fields: {
        title: 'title',
        color: 'color'
    },
    uid: null,
    init: function(uid) {
        if (!this.uid) {
            this.uid = uid
            const form = document.querySelector('#' + this.id);
            const title = form.querySelector(`#${this.id}-${this.fields.title}`);
            const color = form.querySelector(`#${this.id}-${this.fields.color}`);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const ref = firebase.database().ref('user-' + this.uid).child('categories')
                const date = new Date();
                const year = date.getFullYear();
                const month = date.getMonth();
                const data = {
                    title: title.value,
                    color: color.value,
                    amounts: {
                        total: 0,
                        [year]: {
                            total: 0,
                            [month]: {
                                total: 0
                            }
                        }
                    }
                }
                ref.push(data).then(() => {
                    window.dispatchEvent(formEvent)
                })
            })
        }
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <form id="${this.id}">
            <div class="error"></div>
            <label for="${this.id}-${this.fields.title}" class="visually-hidden">Название</label>
            <input type="text" class="form-control" id="${this.id}-${this.fields.title}" placeholder="Название" required="" autofocus="">
            <label for="${this.id}-${this.fields.color}" class="visually-hidden">Цвет карточки</label>
            <input type="color" class="form-control" id="${this.id}-${this.fields.color}" required="">
            <button class="w-100 btn btn-lg btn-primary" type="submit" id="${this.id}-btn">${this.action}</button>
        </form>
        `;
        return html;
    }
}
const AddAccountForm = {
    id: 'addAccountForm',
    action: 'Добавить счет',
    fields: {
        title: 'title',
        color: 'color'
    },
    uid: null,
    init: function(uid) {
        if (!this.uid) {
            this.uid = uid
            const form = document.querySelector('#' + this.id);
            const title = form.querySelector(`#${this.id}-${this.fields.title}`);
            const color = form.querySelector(`#${this.id}-${this.fields.color}`);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const ref = firebase.database().ref('user-' + this.uid).child('accounts')
                const data = {
                    title: title.value,
                    color: color.value,
                    amount: 0
                }
                ref.push(data).then(() => {
                    window.dispatchEvent(formEvent)
                })
            })
        }
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <form id="${this.id}">
            <div class="error"></div>
            <label for="${this.id}-${this.fields.title}" class="visually-hidden">Название</label>
            <input type="text" class="form-control" id="${this.id}-${this.fields.title}" placeholder="Название" required="" autofocus="">
            <label for="${this.id}-${this.fields.color}" class="visually-hidden">Цвет карточки</label>
            <input type="color" class="form-control" id="${this.id}-${this.fields.color}" required="">
            <button class="w-100 btn btn-lg btn-primary" type="submit" id="${this.id}-btn">${this.action}</button>
        </form>
        `;
        return html;
    }
}