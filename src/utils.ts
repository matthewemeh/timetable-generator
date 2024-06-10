function showAlert({
    msg,
    zIndex = '0',
    duration = 3000,
    textColor = '#fff',
    bgColor = COLORS.PRIMARY
}: AlertProps) {
    const alertDiv: HTMLDivElement = document.createElement('div');
    alertDiv.className = CLASSES.ALERT;
    alertDiv.style.bottom = '-150px';
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.background = bgColor;
        alertDiv.style.color = textColor;
        alertDiv.innerHTML = msg;
        alertDiv.style.bottom = '0px';

        if (zIndex !== '0') alertDiv.style.zIndex = zIndex;

        setTimeout(() => {
            alertDiv.style.bottom = '-150px';
            setTimeout(() => document.body.removeChild(alertDiv), 1000);
        }, duration);
    }, 200);
}

function sum(array: number[]): number {
    return array.length > 0 ? array.reduce((x, y) => x + y) : 0;
}

function toggleClass(element?: Element | HTMLElement | null, ...classes: string[]) {
    if (element) classes.forEach(className => element.classList.toggle(className));
}

function addClass(element?: Element | HTMLElement | null, ...classes: string[]) {
    if (element) classes.forEach(className => element.classList.add(className));
}

function removeClass(element?: Element | HTMLElement | null, ...classes: string[]) {
    if (element) classes.forEach(className => element.classList.remove(className));
}

function getRndInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRndColor({
    format = 'RGB',
    min = [0, 0, 0],
    max = [255, 255, 255]
}: GetRndColorProps): string {
    const r: number = getRndInteger(min[0], max[0]);
    const g: number = getRndInteger(min[1], max[1]);
    const b: number = getRndInteger(min[2], max[2]);
    const rgbValue: string = `rgb(${r},${g},${b})`;

    switch (format) {
        case 'HEX':
            return rgbToHex(rgbValue);
        default:
            return rgbValue;
    }
}

function rgbToHex(rgb: string): string {
    const rgbArray: string[] = rgb.replace(/[^\d,]/g, '').split(',');
    let hex: string = '#';
    for (let i = 0; i < rgbArray.length; i++) {
        let num = parseInt(rgbArray[i], 10);
        let strNum = num < 16 ? '0' + num.toString(16) : num.toString(16);
        hex += strNum;
    }
    return hex;
}

function randomSelect(array: any[]): any {
    return array[getRndInteger(0, array.length)];
}

function uuid(): string {
    const UUID_LENGTH = 32,
        characters = '1234567890qwertyuiopasdfghjklzxcvbnm';
    let newUuid: string = '';

    for (let i = 0; i < UUID_LENGTH; i++) {
        newUuid += characters[getRndInteger(0, characters.length)];
    }

    return newUuid;
}

function checkArrayEquality(array1: any[], array2: any[]): boolean {
    let arraysAreSameLength: boolean = array1.length === array2.length;

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

function swapElements(array: any[], index1: number, index2: number) {
    try {
        [array[index1], array[index2]] = [array[index2], array[index1]];
    } catch (error) {
        console.error(error);
    }
}

/**
 * Returns an object containing shortName and name of the day of the week.
 * @param index A integer from 0 to 6.
 */
function getDayDetails(index: number): DayDetail | undefined {
    const dayDetails: { [key: number]: DayDetail } = {
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

/**
 * Returns an object containing shortName and name of a month.
 * @param index An integer from 0 to 11.
 */
function getMonthDetails(index: number): MonthDetail | undefined {
    const monthDetails: { [key: number]: MonthDetail } = {
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

function getDateProps(date?: string | number | Date): DateProps {
    const dateObject: Date = date ? new Date(date) : new Date();

    const dayIndex: number = dateObject.getDay();
    const year: number = dateObject.getFullYear();
    const monthDate: number = dateObject.getDate();
    const minutes: number = dateObject.getMinutes();
    const seconds: number = dateObject.getSeconds();
    const monthIndex: number = dateObject.getMonth();
    const milliseconds: number = dateObject.getMilliseconds();
    const millisecondsFromInception: number = dateObject.getTime();

    const hour24: number = dateObject.getHours();
    const hour12: number = hour24 < 12 ? hour24 : hour24 - 12;
    const am_or_pm: 'am' | 'pm' = hour24 < 12 ? 'am' : 'pm';

    const { name: longMonthName, shortName: shortMonthName }: MonthDetail =
        getMonthDetails(monthIndex)!;

    const { name: longDayOfWeek, shortName: shortDayOfWeek }: DayDetail = getDayDetails(dayIndex)!;

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
