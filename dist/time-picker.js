'use strict';
document.querySelectorAll('.picker').forEach(function (picker) {
    var self = picker;

    var activeFace = self.querySelector('.face-set.hour'),
        min = false,
        am = false,
        mouse = false;

    function $$(q) {
        return self.querySelectorAll(q);
    }

    $$('.face-set').forEach(function (faceSet) {
        faceSet.dataset.handAng = 0;
    });
    $$('.face-set.min').forEach(function (minFaceSet) {
        minFaceSet.dataset.handAng = 1;
    });

    function setHandle(face, a, l, anim) {
        if (a == null) a = parseFloat(face.dataset.handAng);
        if (l == 'hidden') l = face.classList.contains('min') ? 7 : 4;
        if (l == null) l = 5.5;
        var bl = a % 1 == 0 ? l - 0.25 : l;
        var deg = a * 30;
        face.dataset.handAng = a;
        face.querySelector('.handle').style.transform =
            'rotate(' + deg.toFixed(20) + 'deg) translateY(' + -l + 'em)';
        face.querySelector('.handle').classList.toggle('anim', anim);
        face.querySelector('.handle-bar').style.transform =
            'rotate(' + deg.toFixed(20) + 'deg) scaleY(' + bl + ')';
        face.querySelector('.handle-bar').classList.toggle('anim', !!anim);
    }

    function minMode(yes) {
        var cl = yes ? 'min' : 'hour';
        min = yes;
        activeFace.classList.add('face-off');
        setHandle(activeFace, null, 'hidden', true);
        activeFace = self.querySelector('.face-set.' + cl);
        activeFace.classList.remove('face-off');
        setHandle(activeFace, null, null, true);
        $$('.time .active').forEach(function (elem) {
            elem.classList.remove('active');
        });
        $$('.time .part.' + cl).forEach(function (elem) {
            elem.classList.add('active');
        });
    }

    minMode(true);
    minMode(false);

    document.body.addEventListener('mouseup', function () {
        if (mouse && !min) minMode(true);
        mouse = false;
    });

    function setHour(hour) {
        if (hour == 0) hour = 12;
        $$('.time .hour').forEach(function (elem) {
            elem.textContent = hour;
        });
        setHandle(self.querySelector('.face-set.hour'), hour, null, false);
    }

    function setMin(min) {
        if (min == 60) min = 0;
        $$('.time .min').forEach(function (elem) {
            elem.textContent = min.toString().padStart(2, '0');
        });
        setHandle(self.querySelector('.face-set.min'), min / 5, null, false);
    }

    function setAmPm(to_am) {
        am = to_am;
        self.querySelector('.am-pm-btn.am').classList.toggle('active', am);
        self.querySelector('.am-pm-btn.pm').classList.toggle('active', !am);
        $$('.time .am-pm').forEach(function (elem) {
            elem.textContent = am ? 'AM' : 'PM';
        });
    }

    function handleMove(e) {
        if (!mouse) return;
        e.preventDefault();
        var $this = self.querySelector('.face-wrap');
        var pos = $this.getBoundingClientRect();
        var cent = {
            left: pos.left + pos.width / 2,
            top: pos.top + pos.height / 2
        };
        var hrs = (Math.atan2(e.pageY - cent.top, e.pageX - cent.left) / Math.PI) * 6 + 3;
        hrs += 12;
        hrs %= 12;
        if (min) {
            setMin(Math.round(hrs * 5));
        } else {
            setHour(Math.round(hrs));
        }
    }

    self.querySelector('.face-wrap').addEventListener('mousedown', function () {
        mouse = true;
    });
    document.body.addEventListener('mousemove', handleMove);

    $$('.face-set.min').forEach(function (minFaceSet) {
        minFaceSet.classList.add('face-off');
    });
    $$('.time .part.min').forEach(function (part) {
        part.addEventListener('click', function () {
            minMode(true);
        });
    });
    $$('.time .part.hour').forEach(function (part) {
        part.addEventListener('click', function () {
            minMode(false);
        });
    });
    self.querySelector('.am-pm-btn.am').addEventListener('click', function () {
        setAmPm(true);
    });
    self.querySelector('.am-pm-btn.pm').addEventListener('click', function () {
        setAmPm(false);
    });
    $$('.time .am-pm').forEach(function (elem) {
        elem.addEventListener('click', function () {
            setAmPm(!am);
        });
    });
    Array.from(document.querySelectorAll('*')).forEach(function (elem) {
        elem.style.transition = 'none';
    });
    setTimeout(function () {
        Array.from(document.querySelectorAll('*')).forEach(function (elem) {
            elem.style.transition = '';
        });
    });
});
