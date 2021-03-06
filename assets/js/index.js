const components = {
    header: Header,
    container: Container,
    footer: Footer,
    loadingScreen: LoadingScreen,
}

const pages = {
    landing: Landing,
    graphs: Graphs,
    categories: Categories,
    error404: Error404,
    accounts: Accounts
}

const menuItems = {
    categories: Categories,
    graphs: Graphs,
    accounts: Accounts
}
const forms = {
    signInForm: SignInForm, //инициализировали форму авторизации
    signUpForm: SignUpForm,
    addCategoryForm: AddCategoryForm,
    addAccountForm: AddAccountForm
}
const modals = {
    signUpModal: new Modal(forms.signUpForm), //сразу инициализируем модалку регистрации
    signInModal: new Modal(forms.signInForm),
    addCategoryModal: new Modal(forms.addCategoryForm),
    addAccountModal: new Modal(forms.addAccountForm)
}

const dbEvent = new Event('queryComplete')
const formEvent = new Event('formsuccess')

const SPA = function() {
    const View = function() {
        let moduleModel = null;
        let moduleContent = null;
        let moduleContainer = null;
        let moduleRoutes = null; //страницы
        let pageLoadedEvent = null;
        this.init = function(container, model) {
            moduleModel = model;
            moduleContainer = container;
            moduleRoutes = pages;
            moduleContent = moduleContainer.querySelector('#content') //нашли дом элемент контента
            this.renderSidebar(); //вызываем метод отрисовки меню
        }
        this.renderContent = function(routeName, user) {
            routeName = routeName || "landing"; //отобразить определенную страницу? либо страницу по умолчанию(лэндинг)
            console.log(routeName)
            let route = moduleRoutes[routeName] || pages.error404;
            route = (!user && route.auth) ? pages.error404 : route;
            console.log(route)
            switch (route.id) {
                case 'categories': //если ключом является Категория, то выполняется код
                    moduleContent.innerHTML = route.render(`${route.id}-page`); //отрисовываются категории конкретного юзера
                    if (user) route.getCategories(user)
                    break;
                case 'accounts': //если ключом является Категория, то выполняется код
                    moduleContent.innerHTML = route.render(`${route.id}-page`); //отрисовываются категории конкретного юзера
                    if (user) route.getAccounts(user)
                    break;
                default:
                    moduleContent.innerHTML = route.render(`${route.id}-page`); //отрисовываем согласно ключу
                    break;
            }
            window.document.title = route.title; //отображаем тайтл согласно тайтлу из нашей страницы
            this.updateSidebar(route.id) // подсвечивает текущий пункт меню 
            this.updateHeader(user) // как выглядит хэдэр (если кто-то залогинился, если никто не залогинился)
            const pageLoadedEvent = new CustomEvent('pageLoaded', {
                detail: {
                    page: route.id
                }
            });
            window.dispatchEvent(pageLoadedEvent)


        }
        this.updateHeader = function(user) {
            const signInBtn = document.querySelector('#auth-signin') //находим кнопочку авторизации
            const logoutBtn = document.querySelector('#auth-logout') //-- выход
            const signUpBtn = document.querySelector('#auth-signup') //--регистрация
            const userInfo = document.querySelector('#auth-userinfo') //--див, где отображается имя пользователя
            if (user) {
                userInfo.innerHTML = user.email; //записываем в штмл емэил юзера
                userInfo.classList.remove('hidden'); // показываем див с емэйлом
                logoutBtn.classList.remove('hidden'); //показываем кнопку выйти
                signInBtn.classList.add('hidden'); //скрываем кнопку войти
                signUpBtn.classList.add('hidden'); //--зарегистироваться
            } else {
                userInfo.innerHTML = ''; //если юзера нет, то все делаем наоборот
                userInfo.classList.add('hidden');
                logoutBtn.classList.add('hidden');
                signInBtn.classList.remove('hidden');
                signUpBtn.classList.remove('hidden');
            }
        }
        this.renderSidebar = function() {
            let sidebar = moduleContainer.querySelector('#sidebar');
            for (let item in menuItems) {
                let content = menuItems[item].title;
                let link = menuItems[item].id;
                sidebar.innerHTML += SideBarItem.render(content, link);
            }
        }
        this.updateSidebar = function(active) {
            let sidebar = moduleContainer.querySelector('#sidebar');
            let items = sidebar.querySelectorAll('.sidebar-item');
            for (let item of items) {
                let page = item.href.substring(1) //берем атрибут а хреф, берем значение без решетки
                if (page === active) { //если совпадает роутНэйм и пэйдж, то выделяем жирным текст
                    item.classList.add('active');
                } else {
                    item.classList.remove('active') // а остальные элементы не выделяем, (это все из цсс)
                }
            }
        }
    }
    const Model = function() {
        let moduleView = null;
        let user = null;
        let page = 'landing'
        this.init = function(view) {
            moduleView = view;
        }
        this.addCategory = function(title, color) {
            const ref = firebase.database().ref();
            const categories = ref.child('user-' + user.uid).child('categories') //получаем коллекцию по идентификатору
            const newCat = {
                title: title,
                color: color
            }
            categories.push(newCat);
            this.updateState(page)
            modals.addCategoryModal.hide()
        }
        this.addAccount = function(title, color) {
            const ref = firebase.database().ref();
            const accounts = ref.child('user-' + user.uid).child('accounts') //получаем коллекцию по идентификатору
            const newAcc = {
                title: title,
                color: color
            }
            accounts.push(newAcc);
            this.updateState(page)
            modals.addAccountModal.hide()
        }
        this.updateState = function(currentPage) {
            page = currentPage || page
            moduleView.renderContent(page, user);
        }
        this.signOut = function() {
            firebase.auth().signOut()
        }
        //этот метод проверяет состояние юзера, залогинен ты или нет
        this.updateUserState = function(currentUser) {
            user = currentUser;
            this.updateState()
        }
        this.setInitialCategories = function() { //создание начальных категорий
            const categories = firebase.database().ref('user-' + user.uid).child('categories'); //получаем коллекцию по идентификатору
            const initCategories = [{
                    title: 'Продукты',
                    color: '#ffffff'
                },
                {
                    title: 'Транспорт',
                    color: '#ffffff'
                },
                {
                    title: 'Коммунальные платежи',
                    color: '#ffffff'
                },
            ]
            for (let cat of initCategories) {
                categories.push(cat)
            }
        }
    }
    const Controller = function() {
        let moduleContainer = null;
        let moduleModel = null;
        let user = null;
        this.init = function(container, model) {

            moduleContainer = container;
            moduleModel = model;
            window.addEventListener('hashchange', this.updateState)
            window.addEventListener('pageLoaded', (e) => {
                if (e.detail.page == "categories") this.initCategoryPage()
                if (e.detail.page == "accounts") this.initAccountsPage()
            })
            window.addEventListener('queryComplete', (e) => {
                this.updateState()
            })
            window.addEventListener('formsuccess', (e) => {
                for (let modal in modals) {
                    modals[modal].hide()
                }
            })
            components.loadingScreen.show()

            this.updateState() //первая отрисовка, что б увидеть что-нибудь(лэндинг)
            this.initModals()
            this.initForms()
            this.userStateChangeListener()

            const logoutBtn = moduleContainer.querySelector('#auth-logout')
            logoutBtn.addEventListener('click', this.signOut)
        }
        this.initCategoryPage = function() {
            modals.addCategoryModal.init()
            forms.addCategoryForm.init(user.uid)
        }
        this.initAccountsPage = function() {
            modals.addAccountModal.init()
            forms.addAccountForm.init(user.uid)
        }
        this.userStateChangeListener = function() {
            firebase.auth().onAuthStateChanged(function(currentUser) { //обработчик изменения состояния пользователя, этот метод вызывается сам от изменения состояния пользователя(залогинился? разлогинился)
                if (currentUser) { //если юзер зашел, то 
                    user = currentUser
                    moduleModel.updateUserState(currentUser)
                    components.loadingScreen.hide()
                } else {
                    user = null
                    moduleModel.updateUserState(null)
                    components.loadingScreen.hide()
                }
            });
        }
        this.updateState = function() { //из урла берем айдишник страницы и передаем в метод модели
            const page = window.location.hash.substring(1)
            moduleModel.updateState(page)
        }
        this.initModals = function() {
            modals.signInModal.init()
            modals.signUpModal.init()
        }
        this.initForms = function() {
            forms.signInForm.init()
            forms.signUpForm.init()
        }
        this.signOut = function(e) {
            e.preventDefault();
            moduleModel.signOut();
        }
    }
    return {
        init: function(container) {
            this.container = document.querySelector('#' + container);
            this.render()
            this.view = new View();
            this.model = new Model();
            this.controller = new Controller();
            this.view.init(this.container, this.model);
            this.model.init(this.view);
            this.controller.init(this.container, this.model)
        },
        render: function() {
            for (let component in components) { //бежим по ключам в хэше компонентов
                this.container.innerHTML += components[component].render()
            }
            for (let modal in modals) {
                this.container.innerHTML += modals[modal].render();
            }
        }
    }
}()
document.addEventListener('DOMContentLoaded', function() {
    SPA.init('root')
})