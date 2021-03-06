// файл описывает содержимое блока контент

// приветствие
const Landing = {
    id: 'landing',
    title: 'Welcome!',
    auth: false,
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <div class="row">
            <div class="col">
                <div class="mask">
                    <h1>Домашняя бухгалтерия: контролируйте Личные финансы Бесплатно</h1>
                    <h2>Учет личных и домашних финансов, расходов и доходов.</h2>
                    <p class="${classNames}">Полный контроль над домашними финансами!</p>
                    <div class="ol">
                        <p>Пять причин начать вести бухгалтерию семьи и личные финансы уже сегодня:</p>
                        <ol>
                            <li>Простота — Не нужно обладать никакими специальными бухгалтерскими знаниями </li>
                            <li>Польза — Ведение учета домашних финансов поможет в достижении финансовых целей, обеспечит полный контроль </li>
                            <li>Выгода — Анализируя свой бюджет, можно избежать излишних расходов </li>
                            <li>Практичность — Полный набор функций, необходимых для контроля домашних финансов </li>
                            <li>Удобство — Вы всегда в курсе точной суммы своих сбережений </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
         `;
        return html
    }
}

const CategoryCard = {
    render: function(id, category) {
        const html = `
        <div class="col category-card" data-id="${id}">
            <div class="card" style="background-color: ${category.color}">
                <div class="card-body">
                    <h5 class="card-title">${category.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Сумма</h6>
                </div>
            </div>
        </div>`;
        return html;
    }
}

//категории отражаются в зависимости от учетной записи 
const Categories = {
    id: 'categories',
    title: 'Категории',
    auth: true,
    getCategories: function(user) {
        const categories = firebase.database().ref('user-' + user.uid).child('categories');
        categories.get().then((response) => {
            this.renderCategories(response.val())
        })
    },
    renderCategories: function(data) {
        const categoryCards = document.querySelector(`#${this.id}-cards`)
        let categoryCardsHTML = ''
        for (let cat in data) {
            categoryCardsHTML += CategoryCard.render(cat, data[cat])
        }
        categoryCards.innerHTML = categoryCardsHTML
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <div class="row">
            <div class="col">
                <p class="h1 ${classNames}">
                Категории
                </p>
            </div>
        </div>
        <div id="${this.id}-cards" class="row row-cols-1 row-cols-md-3 g-4">            
        </div>
        <div class="row row-cols-1">
        <div class="col" data-modal="#addCategoryForm-modal">
                <div class="card">
                    <div class="card-body add-category" >
                    <i class="fas fa-plus-circle"></i>
                    </div>
                </div>
            </div>
        </div>
        `
        return html
    }
}

//Отчет (графики)
const Graphs = {
    id: 'graphs',
    title: 'Отчет',
    auth: true,
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
            <p class="${classNames}">
            Отчет
            </p>
        `
        return html
    }
}
const AccountCard = {
    init: function(id, account, user) {
        const card = document.querySelector(`[data-id="${id}"]`)
        const addMoneyBtn = card.querySelector('.addMoney-btn')
        addMoneyBtn.addEventListener('click', () => {
            const money = card.querySelector('.money')
            const amount = Number(money.value)
            if (isNaN(amount) || (amount <= 0)) {
                return
            }
            const operations = firebase.database().ref(`user-${user.uid}`).child('operations')
            const data = {
                account: {
                    id: id,
                    title: account.title
                },
                amount: amount
            }
            operations.push(data).then(() => {
                window.dispatchEvent(dbEvent)
                window.dispatchEvent(formEvent)
            })
        })
    },
    render: function(id, account) {
        const html = `
        <div class="col account-card" data-id="${id}">
            <div class="card" style="background-color: ${account.color}">
                <div class="card-body">
                    <h5 class="card-title">${account.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Сумма</h6>
                </div>
                <div class="card-body">
                <p class="card-text">Добавить сумму</p>
                <input type="number" class="form-control money" /> 
                <button class="btn btn-sm btn-success mt-2 addMoney-btn">Добавить</button>
                </div>
            </div>
        </div>`;
        return html;
    }
}
//Счета
const Accounts = {
    id: 'accounts',
    title: 'Счета',
    auth: true,
    getAccounts: function(user) {
        const accounts = firebase.database().ref('user-' + user.uid).child('accounts');
        accounts.get().then((response) => {
            this.renderAccounts(response.val(), user)
        })
    },
    renderAccounts: function(data, user) {
        const accountsCards = document.querySelector(`#${this.id}-cards`)
        let accountsCardsHTML = ''
        for (let cat in data) {
            accountsCardsHTML += AccountCard.render(cat, data[cat])

        }
        accountsCards.innerHTML = accountsCardsHTML
        for (let cat in data) {
            AccountCard.init(cat, data[cat], user)
        }

        // const addMoneyBtn = accountsCards.querySelectorAll('.addMoney-btn')
        // addMoneyBtn.addEventListener('click', (e) => {

        // })
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
        <div class="row">
            <div class="col">
                <p class="h1 ${classNames}">
                Счета
                </p>
            </div>
        </div>
        <div id="${this.id}-cards" class="row row-cols-1 row-cols-md-3 g-4">            
        </div>
        <div class="row row-cols-1">
        <div class="col" data-modal="#addAccountForm-modal">
                <div class="card">
                    <div class="card-body add-accounts" >
                    <i class="fas fa-plus-circle"></i>
                    </div>
                </div>
            </div>
        </div>
        `
        return html
    }
}
//на случай, если страница не найдена
const Error404 = {
    id: 'error404',
    title: 'Error404',
    auth: false,
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
            <p class="${classNames}">
            Error
            Page not found
            </p>
        `
        return html
    }
}