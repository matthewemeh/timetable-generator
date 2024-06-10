"use strict";
function showAlert({ msg, zIndex = '0', duration = 3000, textColor = '#fff', bgColor = COLORS.PRIMARY }) {
    const alertDiv = document.createElement('div');
    alertDiv.className = CLASSES.ALERT;
    alertDiv.style.bottom = '-150px';
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.style.background = bgColor;
        alertDiv.style.color = textColor;
        alertDiv.innerHTML = msg;
        alertDiv.style.bottom = '0px';
        if (zIndex !== '0')
            alertDiv.style.zIndex = zIndex;
        setTimeout(() => {
            alertDiv.style.bottom = '-150px';
            setTimeout(() => document.body.removeChild(alertDiv), 1000);
        }, duration);
    }, 200);
}
function sum(array) {
    return array.length > 0 ? array.reduce((x, y) => x + y) : 0;
}
function toggleClass(element, ...classes) {
    if (element)
        classes.forEach(className => element.classList.toggle(className));
}
function addClass(element, ...classes) {
    if (element)
        classes.forEach(className => element.classList.add(className));
}
function removeClass(element, ...classes) {
    if (element)
        classes.forEach(className => element.classList.remove(className));
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function getRndColor({ format = 'RGB', min = [0, 0, 0], max = [255, 255, 255] }) {
    const r = getRndInteger(min[0], max[0]);
    const g = getRndInteger(min[1], max[1]);
    const b = getRndInteger(min[2], max[2]);
    const rgbValue = `rgb(${r},${g},${b})`;
    switch (format) {
        case 'HEX':
            return rgbToHex(rgbValue);
        default:
            return rgbValue;
    }
}
function rgbToHex(rgb) {
    const rgbArray = rgb.replace(/[^\d,]/g, '').split(',');
    let hex = '#';
    for (let i = 0; i < rgbArray.length; i++) {
        let num = parseInt(rgbArray[i], 10);
        let strNum = num < 16 ? '0' + num.toString(16) : num.toString(16);
        hex += strNum;
    }
    return hex;
}
function randomSelect(array) {
    return array[getRndInteger(0, array.length)];
}
function uuid() {
    const UUID_LENGTH = 32, characters = '1234567890qwertyuiopasdfghjklzxcvbnm';
    let newUuid = '';
    for (let i = 0; i < UUID_LENGTH; i++) {
        newUuid += characters[getRndInteger(0, characters.length)];
    }
    return newUuid;
}
function checkArrayEquality(array1, array2) {
    let arraysAreSameLength = array1.length === array2.length;
    if (!arraysAreSameLength) {
        return false;
    }
    for (let i = 0; i < array1.length; i++) {
        if (!array2.includes(array1[i])) {
            return false;
        }
    }
    for (let j = 0; j < array2.length; j++) {
        if (!array1.includes(array2[j])) {
            return false;
        }
    }
    return true;
}
function swapElements(array, index1, index2) {
    try {
        [array[index1], array[index2]] = [array[index2], array[index1]];
    }
    catch (error) {
        console.error(error);
    }
}
function getDayDetails(index) {
    const dayDetails = {
        0: { name: 'Sunday', shortName: 'Sun' },
        1: { name: 'Monday', shortName: 'Mon' },
        2: { name: 'Tuesday', shortName: 'Tue' },
        3: { name: 'Wednesday', shortName: 'Wed' },
        4: { name: 'Thursday', shortName: 'Thu' },
        5: { name: 'Friday', shortName: 'Fri' },
        6: { name: 'Saturday', shortName: 'Sat' }
    };
    return dayDetails[index];
}
function getMonthDetails(index) {
    const monthDetails = {
        0: { name: 'January', shortName: 'Jan' },
        1: { name: 'February', shortName: 'Feb' },
        2: { name: 'March', shortName: 'Mar' },
        3: { name: 'April', shortName: 'Apr' },
        4: { name: 'May', shortName: 'May' },
        5: { name: 'June', shortName: 'Jun' },
        6: { name: 'July', shortName: 'Jul' },
        7: { name: 'August', shortName: 'Aug' },
        8: { name: 'September', shortName: 'Sep' },
        9: { name: 'October', shortName: 'Oct' },
        10: { name: 'November', shortName: 'Nov' },
        11: { name: 'December', shortName: 'Dec' }
    };
    return monthDetails[index];
}
function getDateProps(date) {
    const dateObject = date ? new Date(date) : new Date();
    const dayIndex = dateObject.getDay();
    const year = dateObject.getFullYear();
    const monthDate = dateObject.getDate();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();
    const monthIndex = dateObject.getMonth();
    const milliseconds = dateObject.getMilliseconds();
    const millisecondsFromInception = dateObject.getTime();
    const hour24 = dateObject.getHours();
    const hour12 = hour24 < 12 ? hour24 : hour24 - 12;
    const am_or_pm = hour24 < 12 ? 'am' : 'pm';
    const { name: longMonthName, shortName: shortMonthName } = getMonthDetails(monthIndex);
    const { name: longDayOfWeek, shortName: shortDayOfWeek } = getDayDetails(dayIndex);
    return {
        year,
        hour12,
        hour24,
        minutes,
        seconds,
        am_or_pm,
        monthDate,
        milliseconds,
        longMonthName,
        longDayOfWeek,
        shortDayOfWeek,
        shortMonthName,
        month: monthIndex + 1,
        dayOfWeek: dayIndex + 1,
        millisecondsFromInception
    };
}
