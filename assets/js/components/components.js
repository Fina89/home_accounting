const Header = {
    id: 'header',
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
            <header id="${this.id}" class="header">
                <div class="container header-container ${classNames}">
                    <a href="/" class="logo"><i class="fas fa-hand-holding-usd"></i> Домашняя бухгалтерия</a>
                    <div class="auth-controls" id="auth-controls">
                        <a type="button" class="btn btn-light" id="auth-signin" data-modal="#signInForm-modal" href="#">Войти</a>
                        <a type="button" class="btn btn-light" id="auth-signup" data-modal="#signUpForm-modal" href="#">Зарегистрироваться</a>
                        <div class="user-info hidden" id="auth-userinfo"></div>
                        <a type="button" class="btn btn-light hidden" id="auth-logout">Выйти</a>
                    </div>
                </div>
            </header>
        `;
        return html;
    }
}
const Content = {
    id: 'content',
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
            <div id="${this.id}"  class="content container-fluid ${classNames}">
            </div>
        `;
        return html;
    }
}
// боковое меню
const SideBar = {
    id: 'sidebar',
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
            <div id="${this.id}"  class="sidebar ${classNames}">
            </div>
        `;
        return html;
    }
}
// один пункт меню из сайд бар
const SideBarItem = {
    id: 'sidebar',
    render: function(content, link, classNames) {
        classNames = classNames || ""
        const html = `
            <a href="#${link}" class="sidebar-item ${classNames}">
            ${content}
            </a>
        `;
        return html;
    }
}
const Container = {
    id: 'container',
    render: function(classNames) {
        classNames = classNames || ""
        const sidebar = SideBar.render()
        const content = Content.render()
        const html = `
            <div class="content-container ${classNames}">
                ${sidebar}
                ${content}
            </div>
        `;
        return html;
    }
}

const Footer = {
    id: 'footer',
    render: function(classNames) {
        classNames = classNames || ""
        const html = `
            <div id="${this.id}"  class="${classNames}">
            </div>
        `;
        return html;
    }
}
// класс, описывающий модалку
function Modal(component) {
    this.id = component.id + '-modal';
    this.component = component;
    this.init = function() {
        const btn = document.querySelector(`[data-modal="#${this.id}"]`)
        const modal = document.querySelector(`#${this.id}`)
        btn.addEventListener('click', (e) => this.show(e))
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) this.hide(e)
        })
    }
    this.hide = function(e) {
        document.querySelector(`#${this.id}`).classList.add('hidden')
    }
    this.show = function(e) {
        document.querySelector(`#${this.id}`).classList.remove('hidden')
    }
    this.render = function(classNames) {
        classNames = classNames || ""
        const html = `
            <div class="custom-modal-fade close-modal hidden" id="${this.id}">
                <div class="custom-modal-content">
                <div class="custom-modal-header">
                <i class="fas fa-times close-modal"></i>
                </div>
                    ${this.component.render()}
                </div>
            </div>
        `;
        return html;
    }
}

// экран загрузки
const LoadingScreen = {
    show: function() {
        document.querySelector('.loading-screen').classList.remove('hidden')
    },
    hide: function() {
        document.querySelector('.loading-screen').classList.add('hidden')
    },
    render: function() {
        const html = `<div class="loading-screen hidden">
        <div class="spinner"><i class="fas fa-sync-alt"></i></div>
        
        <div class="loading-text">Загрузка</div>
        </div>`;
        return html;
    }
}