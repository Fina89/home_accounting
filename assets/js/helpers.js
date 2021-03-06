//этот документ обрабатывает ошибки


function showError(form, errorMessage) { //(принимает в себя поле ввода логина-пароля, место, где отразить ошибку, текст ошибки)
    const errorEl = document.createElement('div')
    errorEl.classList.add('alert')
    errorEl.classList.add('alert-danger')
    errorEl.innerHTML = errorMessage
    const errorPlaceholder = form.querySelector(`.error`)
    errorPlaceholder.appendChild(errorEl)
    setTimeout(function() { //через 2 секунды убирается текст ошибки и место отоборажения текста
        errorPlaceholder.remove(errorEl)
    }, 3000)
}

function blockForm(form) { //заблокировать форму
    let formEl = document.querySelector('#' + form.id)
    let inputs = formEl.querySelectorAll('input, button')
    for (let el of inputs) {
        el.setAttribute('disabled', 'disabled') // всем инпутам и баттонам ставим дизэйбл
        if (el.tagName == 'BUTTON') { //если тег ябляется баттоном, то внутри кнопки появляется спинер
            el.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
            `
        }
    }
}

function unblockForm(form) { // разблокировать форму
    let formEl = document.querySelector('#' + form.id)
    let inputs = formEl.querySelectorAll('input, button')
    for (let el of inputs) {
        el.removeAttribute('disabled')
        if (el.tagName == 'BUTTON') {
            el.innerHTML = form.action //свойство экшн объекта формы
        }
    }
}