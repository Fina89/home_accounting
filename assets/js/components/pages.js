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

const CategoryCard = { // объект одной каторчки категории расходов
    init: function(id, category, accountsRef, categoriesRef, operationsRef, accounts) { //сначала происодит рендер, 
        const card = document.querySelector(`[data-id="${id}"]`)
        const addMoneyBtn = card.querySelector('.addMoney-btn')

        addMoneyBtn.addEventListener('click', () => {
            const money = card.querySelector('.money')
            const comment = card.querySelector('.comment')

            const accountId = card.querySelector('.account').value; //получаем значения из инпута счет
            const account = accounts[accountId]; // по айдишнику выбиаю конкретный счет
            const amount = Number(money.value); // сумма, которую мы записали в расход
            if (isNaN(amount) || (amount <= 0)) {
                return
            }
            const date = new Date(); // дата операции 
            const year = date.getFullYear();
            const month = date.getMonth();
            if (!(year in category.amounts)) { // если операция первая в году, то создаем новый ключ с новым годом
                category.amounts[year] = {
                    total: 0
                }
            }
            if (!(month in category.amounts[year])) {
                category.amounts[year][month] = {
                    total: 0
                }
            }
            const data = { // объект операции, которую положим в базу
                category: {
                    id: id,
                    title: category.title
                },
                account: {
                    id: accountId,
                    title: account.title,
                },
                type: 'withdrawal', // тип операции - изъятие денег
                amount: amount,
                comment: comment.value || '',
                ts: date.getTime()
            }
            category.amounts.total += amount // обновляем суммы на счетах за опеделенный период
            category.amounts[year].total += amount
            category.amounts[year][month].total += amount
            operationsRef.push(data).then(() => { // отпавляем данные об операции в б/д
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
    render: function(accounts, id, category) { //сначала происодит рендер, т.к. нам нужен штмл
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
            <div class="card circle" style="background-color: ${category.color}">
                <div class="card-body">
                    <h5 class="card-title">${category.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Общий расход: ${category.amounts.total}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Расход за текущий год: ${category.amounts[year].total}</h6>
                    <h6 class="card-subtitle mb-2 text-muted">Расход за текущий месяц: ${category.amounts[year][month].total}</h6>
                </div>
                <div class="card-body">
                <p class="card-text">Добавить расход</p>
                ${accountsHTML}
                <input type="number" class="form-control money" placeholder="Сумма" /> 
                <input type="text" class="form-control comment" placeholder="Комментарий" /> 
                <button class="btn btn-sm btn-success mt-2 addMoney-btn">Добавить</button>
                </div>
            </div>
        </div>`;
        return html;
    }
}

//категории отражаются в зависимости от учетной записи 
const Categories = { // когда поменялся хэш и стал катигори, то обображаем рендер 163 стр. если залогинен польховательтель, то вызывает гет катигориз
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
    getCategories: function(user) { // получаем ссылки на базу данных
        this.accountsRef = firebase.database().ref('user-' + user.uid).child('accounts');
        this.operationsRef = firebase.database().ref(`user-${user.uid}`).child('operations');
        this.categoriesRef = firebase.database().ref('user-' + user.uid).child('categories');
        this.categoriesRef.off('value'); // сбросить слушатель и повесить новый
        this.accountsRef.get().then((snapshot) => { // есть ссылка на базу со счетами, достаем значения из базы данных
            const accounts = snapshot.val() // получили все наши счета
            this.categoriesRef.on('value', (snapshot) => { // достаем все наши категории расходов
                this.renderCategories(accounts, snapshot.val()) // отрисовываем контейнер для карточек
            });
        });

    },
    renderCategories: function(accounts, data) {
        const categoryCards = document.querySelector(`#${this.id}-cards`); //где будут лежать категории
        if (!categoryCards) return;
        let categoryCardsHTML = '';
        categoryCards.innerHTML = categoryCardsHTML; // опустошаем контейнер
        for (let cat in data) { // бежим циклом по категориям из б/д
            categoryCardsHTML += CategoryCard.render(accounts, cat, data[cat]) //создаем штмл со всеми карточками

        }
        categoryCards.innerHTML = categoryCardsHTML; // добавляем на страницу штмл
        for (let cat in data) {
            CategoryCard.init(cat, data[cat], this.accountsRef, this.categoriesRef, this.operationsRef, accounts) // инит.
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

function Graph(data) {
    this.data = data;
}
Graph.prototype.drawCanvas = function() {
    return `<canvas id=${this.id}></canvas>`
}
Graph.prototype.drawGraph = function(timeFrame, year, month) {
    let data;
    let amounts;
    switch (timeFrame) { // за весь период
        case 'all':
            data = Object.values(this.data).map((el) => { // получили массив из трех эл
                return {
                    color: el.color,
                    title: el.title,
                    amount: el.amounts.total
                }
            })
            amounts = Object.values(this.data).map((el) => el.amounts.total) // список сумм расходов
            break;
        case 'year':
            if (!year) return
            data = Object.values(this.data).map((el) => {
                if (year in el.amounts) {
                    return {
                        color: el.color,
                        title: el.title,
                        amount: el.amounts[year].total
                    }
                }
                return null;
            })
            amounts = Object.values(this.data).map((el) => {
                if (year in el.amounts) {
                    return el.amounts[year].total
                }
                return null;
            })
            break;
        case 'month':
            if (!year || !month) return
            data = Object.values(this.data).map((el) => {
                if ((year in el.amounts) && (month in el.amounts[year]))
                    return {
                        color: el.color,
                        title: el.title,
                        amount: el.amounts[year][month].total
                    }
                return null
            })
            amounts = Object.values(this.data).map((el) => { // если за период не существует данных
                if ((year in el.amounts) && (month in el.amounts[year])) {
                    return el.amounts[year][month].total
                }
                return null;
            })
            break;
        default:
            return
    }
    data = data.filter((el) => el) // возвращаем элемент (тру, фолз)
    amounts = amounts.filter((el) => el) // возвращаем только суммы
    const maxAmount = Math.max.apply(null, amounts); // максимальная сумма будет занимать максимально места на экране
    const totalAmount = data.reduce((prev, cur) => prev + cur.amount, 0) // сложили все суммы расходов(100%)
    const canvas = document.getElementById(this.id);
    const content = document.getElementById('content')
    canvas.width = content.offsetWidth - 50;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')

    let widthPercentage = 0
    if (!data.length) { // еси нет данных
        ctx.fillStyle = '#000000'
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Нет данных за выбранный период", canvas.width / 2, canvas.height / 2)
        return
    }
    let animation = setInterval(() => {
        ctx.fillStyle = '#ffffff'
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let Y = 50;
        let X = 150;
        let shiftY = 50
        ctx.lineWidth = 25
        for (let cat of data) {
            const barWidth = Math.ceil((cat.amount * (canvas.width - 300) * (widthPercentage / 100)) / maxAmount); // длина строки графика
            const percentage = Math.round((cat.amount / totalAmount) * 10000) / 100 // сколько процентов, пишется в конце строки
            ctx.beginPath();
            ctx.moveTo(X, Y);
            ctx.lineTo(X + barWidth, Y);
            ctx.strokeStyle = cat.color;
            ctx.stroke();
            ctx.fillStyle = '#000000'
            ctx.font = '20px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(cat.title, 0, Y)
            ctx.textAlign = "end";
            ctx.fillText(`${cat.amount} (${percentage}%)`, canvas.width, Y);
            Y += shiftY;
        }
        widthPercentage += 5
        if (widthPercentage > 100) {
            clearInterval(animation)
        }
    }, 50)


}
//Отчет (графики)//сначала ендер, отрисовка кнопок, потом инит, вешаем события, потом гет катигори и рендер граф
const Graphs = {
    id: 'graphs',
    title: '<i class="fas fa-chart-bar"></i> Обзор',
    auth: true,
    categoriesRef: null,
    getCategories: function(user, timeframe, year, month) {
        this.categoriesRef = firebase.database().ref(`user-${user.uid}`).child('categories');
        this.categoriesRef.off('value');
        this.categoriesRef.on('value', (snapshot) => {
            this.renderGraphs(snapshot.val(), timeframe, year, month)
        });
    },
    renderGraphs: function(data, timeframe, year, month) {
        const graphs = document.querySelector(`#${this.id}`)
        graphs.innerHTML = ''
        const graph = new Graph(data)
        const graphHTML = graph.drawCanvas()
        graphs.innerHTML = graphHTML
        graph.drawGraph(timeframe, year, month)

    },
    init: function(user) {
        const btn = document.querySelector('#showGraph');
        btn.addEventListener('click', () => {
            const timeframe = document.querySelector('#timeframe').value;
            const year = document.querySelector('#year').value;
            const month = document.querySelector('#month').value;
            this.getCategories(user, timeframe, year, month)
        })
        this.getCategories(user, 'all')
    },
    render: function(classNames) {
        classNames = classNames || ""
        const months = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]
        let monthsOptions = ''
        for (let i = 0; i < months.length; i++) {
            monthsOptions += `<option value="${i}">${months[i]}</option>`
        }
        const html = `
            <div class="row g-3">
                <div class="col-auto">
                    <select id="timeframe" class="form-select">
                    <option value="all">За все время</option>
                    <option value="year">За год</option>
                    <option value="month">За месяц</option>
                    </select>
                </div>
                <div class="col-auto">
                    <input type="number" class="form-control" id="year" max="3000" min="2000" placeholder="Год" />
                </div>
                <div class="col-auto">
                    <select id="month" class="form-select">
                    ${monthsOptions}
                    </select>
                </div>
                <div class="col-auto">
                    <button class="btn btn-primary" id="showGraph">Показать</button>
                </div>
            </div>
            <div class="col" id="${this.id}">
            </div>
            </div>
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
            const comment = card.querySelector('.comment')
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
                comment: comment.value || '',
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
            <div class="card circle" style="background-color: ${account.color}">
                <div class="card-body">
                    <h5 class="card-title">${account.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Сумма: ${account.amount}</h6>
                </div>
                <div class="card-body">
                <p class="card-text">Добавить сумму</p>
                <input type="number" class="form-control money" placeholder="Сумма" /> 
                <input type="text" class="form-control comment" placeholder="Комментарий" /> 
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
    id: 'operations',
    title: '<i class="far fa-list-alt"></i> Операции',
    auth: true,
    accountsRef: null,
    operationsRef: null,
    getOperations: function(user) {
        this.operationsRef = firebase.database().ref(`user-${user.uid}`).child('operations')
        this.operationsRef.off('value');
        this.operationsRef.on('value', (snapshot) => {
            this.renderOperations(snapshot.val())
        });
    },
    renderOperations: function(data) {
        const opArray = Object.values(data);
        const sortedArray = opArray.sort((a, b) => {
            return b.ts - a.ts
        })
        const operationsTable = document.querySelector(`#${this.id}-table`)
        if (!operationsTable) return;
        let operationsTableHTML = ''
        operationsTable.innerHTML = operationsTableHTML;
        for (let op of sortedArray) {
            const date = new Date(op.ts).toLocaleDateString('en-GB');
            const amount = op.amount;
            let comment = op.comment || '';
            let from = '';
            let to = '';
            let type, className;
            if (op.type === 'withdrawal') {
                type = 'Расход';
                className = 'table-danger';
                from = op.account.title;
                to = op.category.title;
            } else if (op.type === 'deposit') {
                type = 'Начисление';
                className = 'table-success'
                to = op.account.title;
            } else {
                type = 'Другое';
                className = 'table-light'
            }
            operationsTableHTML += `
            <tr class="${className}">
            <td>${date}</td>
            <td>${amount}</td>
            <td>${type}</td>
            <td>${from}</td>
            <td>${to}</td>
            <td>${comment}</td>
            </tr>`
        }
        operationsTable.innerHTML = operationsTableHTML
    },
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
    <div class="row">
    <div class="col">
    <table class="table table-sm">
    <thead>
    <tr>
    <th scope="col">Дата</th>
      <th scope="col">Сумма</th>
      <th scope="col">Тип операции</th>
      <th scope="col">Со счета</th>
      <th scope="col">Куда</th>
      <th scope="col">Комментарий</th>
    </tr>
  </thead>
  <tbody id="${this.id}-table">
  </tbody>
    </table>
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