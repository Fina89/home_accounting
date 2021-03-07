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
    init: function(id, category, accountsRef, categoriesRef, operationsRef, accounts) {
        const card = document.querySelector(`[data-id="${id}"]`)
        const addMoneyBtn = card.querySelector('.addMoney-btn')

        addMoneyBtn.addEventListener('click', () => {
            const money = card.querySelector('.money')
            const accountId = card.querySelector('.account').value
            const account = accounts[accountId]
            const amount = Number(money.value)
            if (isNaN(amount) || (amount <= 0)) {
                return
            }
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth();
            if (!(year in category.amounts)) {
                category.amounts[year] = {
                    total: 0
                }
            }
            if (!(month in category.amounts[year])) {
                category.amounts[year][month] = {
                    total: 0
                }
            }
            const data = {
                category: {
                    id: id,
                    title: category.title
                },
                account: {
                    id: accountId,
                    title: account.title,
                },
                type: 'withdrawal',
                amount: amount,
                ts: date.getTime()
            }
            category.amounts.total += amount
            category.amounts[year].total += amount
            category.amounts[year][month].total += amount
            operationsRef.push(data).then(() => {
                account.amount -= amount
                accountsRef.child(accountId).update({
                    amount: account.amount,
                })
                categoriesRef.child(id).update({
                    amounts: category.amounts,
                })
            })
        })
    },
    render: function(accounts, id, category) {
        let accountsHTML = '<select class="form-select account">'
        for (let account in accounts) {
            accountsHTML += `<option value="${account}" style="background-color: ${accounts[account].color}">${accounts[account].title}</option>`
        }
        accountsHTML += '</select>'
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        console.log(category.amounts[year])
        const html = `
        <div class="col category-card" data-id="${id}">
            <div class="card" style="background-color: ${category.color}">
                <div class="card-body">
                    <h5 class="card-title">${category.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Общий расход: ${category.amounts.total}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Расход за текущий год: ${category.amounts[year].total}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Расход за текущий месяц: ${category.amounts[year][month].total}</h6>
                </div>
                <div class="card-body">
                <p class="card-text">Добавить расход</p>
                ${accountsHTML}
                <input type="number" class="form-control money" /> 
                <button class="btn btn-sm btn-success mt-2 addMoney-btn">Добавить</button>
                </div>
            </div>
        </div>`;
        return html;
    }
}

//категории отражаются в зависимости от учетной записи 
const Categories = {
    id: 'categories',
    title: '<i class="fas fa-money-bill-alt"></i> Категории расходов',
    auth: true,
    accountsRef: null,
    operationsRef: null,
    categoriesRef: null,
    data: {
        accountsLoaded: false,
        categoriesLoaded: false,
        operationsLoaded: false
    },
    getCategories: function(user) {
        this.accountsRef = firebase.database().ref('user-' + user.uid).child('accounts');
        this.operationsRef = firebase.database().ref(`user-${user.uid}`).child('operations');
        this.categoriesRef = firebase.database().ref('user-' + user.uid).child('categories');
        this.categoriesRef.off('value');
        this.accountsRef.get().then((snapshot) => {
            const accounts = snapshot.val()
            this.categoriesRef.on('value', (snapshot) => {
                this.renderCategories(accounts, snapshot.val())
            });
        });

    },
    renderCategories: function(accounts, data) {
        const categoryCards = document.querySelector(`#${this.id}-cards`)
        if (!categoryCards) return;
        let categoryCardsHTML = ''
        categoryCards.innerHTML = categoryCardsHTML;
        for (let cat in data) {
            categoryCardsHTML += CategoryCard.render(accounts, cat, data[cat])

        }
        categoryCards.innerHTML = categoryCardsHTML
        for (let cat in data) {
            CategoryCard.init(cat, data[cat], this.accountsRef, this.categoriesRef, this.operationsRef, accounts)
        }
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
    title: '<i class="fas fa-chart-bar"></i> Обзор',
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
    init: function(id, account, accountsRef, operationsRef) {
        const card = document.querySelector(`[data-id="${id}"]`)
        const addMoneyBtn = card.querySelector('.addMoney-btn')
        const currentAccountRef = accountsRef.child(id)
        addMoneyBtn.addEventListener('click', () => {
            const money = card.querySelector('.money')
            const amount = Number(money.value)
            if (isNaN(amount) || (amount <= 0)) {
                return
            }
            const data = {
                account: {
                    id: id,
                    title: account.title
                },
                type: 'deposit',
                amount: amount,
                ts: new Date().getTime()
            }
            operationsRef.push(data).then(() => {
                currentAccountRef.update({
                    amount: account.amount + amount,
                })
            })
        })
    },
    render: function(id, account) {
        const html = `
        <div class="col account-card" data-id="${id}">
            <div class="card" class="circle" style="background-color: ${account.color}">
                <div class="card-body">
                    <h5 class="card-title">${account.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Сумма: ${account.amount}</h6>
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
    title: '<i class="fas fa-wallet"></i> Счета',
    auth: true,
    accountsRef: null,
    operationsRef: null,
    getAccounts: function(user) {
        this.accountsRef = firebase.database().ref('user-' + user.uid).child('accounts');
        this.operationsRef = firebase.database().ref(`user-${user.uid}`).child('operations');
        this.accountsRef.off('value');
        this.accountsRef.on('value', (snapshot) => {
            this.renderAccounts(snapshot.val())
        });
    },
    renderAccounts: function(data) {
        const accountsCards = document.querySelector(`#${this.id}-cards`)
        if (!accountsCards) return;
        let accountsCardsHTML = ''
        accountsCards.innerHTML = accountsCardsHTML;
        for (let cat in data) {
            accountsCardsHTML += AccountCard.render(cat, data[cat])

        }
        accountsCards.innerHTML = accountsCardsHTML
        for (let cat in data) {
            AccountCard.init(cat, data[cat], this.accountsRef, this.operationsRef)
        }
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

const Operations = {
<<<<<<< HEAD
    id: 'Operations',
    title: 'Операции',
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
=======
        id: 'Operations',
        title: '<i class="far fa-list-alt"></i> Операции',
        render: function(classNames) {
            classNames = classNames || ""
            const html = `
>>>>>>> 0391c18 (add icons)
    <p class="${classNames}">
    Операции
    </p>
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