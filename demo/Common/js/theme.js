/* theme.js — 导出页浅色 / 深色切换，以及长页回到顶部。
   依据 localStorage('qz-theme') 设置 html[data-theme]，注入右下角按钮。
   不依赖 jQuery。 */
(function () {
    var STORAGE_KEY = 'qz-theme';
    var ICON_LIGHT = '\u263D'; // ☽ 当前浅色，点击切到深色
    var ICON_DARK = '\u2600';  // ☀ 当前深色，点击切到浅色
    var BACK_TOP_AFTER = 320;

    function getStored() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // 尽早应用，减少主题闪烁
    if (getStored() === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    function apply(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {}
        var btn = document.getElementById('qz-theme-toggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? ICON_DARK : ICON_LIGHT;
        }
    }

    function initToggle() {
        if (document.getElementById('qz-theme-toggle') || !document.body) {
            return;
        }
        var btn = document.createElement('button');
        btn.id = 'qz-theme-toggle';
        btn.type = 'button';
        btn.title = '切换深色/浅色模式';
        btn.setAttribute('aria-label', '切换深色/浅色模式');
        btn.textContent = isDark() ? ICON_DARK : ICON_LIGHT;
        btn.addEventListener('click', function () {
            apply(isDark() ? 'light' : 'dark');
        });
        document.body.appendChild(btn);
    }

    function initBackToTop() {
        if (document.getElementById('qz-back-to-top') || !document.body) {
            return;
        }
        var btn = document.createElement('button');
        btn.id = 'qz-back-to-top';
        btn.type = 'button';
        btn.title = '回到顶部';
        btn.setAttribute('aria-label', '回到顶部');
        btn.textContent = '\u2191';
        btn.addEventListener('click', function () {
            var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
        document.body.appendChild(btn);

        var ticking = false;
        function update() {
            ticking = false;
            var y = window.pageYOffset || document.documentElement.scrollTop || 0;
            if (y > BACK_TOP_AFTER) {
                btn.classList.add('is-visible');
            } else {
                btn.classList.remove('is-visible');
            }
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    function initChrome() {
        initToggle();
        initBackToTop();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChrome);
    } else {
        initChrome();
    }
})();
