let Utils = {
    /**
     * 是否为闫年
     */
    isLeapYear: function(y) {
        return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    },

    /**
     * 返回星期数
     */
    getWhatDay: function(year, month, day) {
        let date = new Date(year + '/' + month + '/' + day);
        let index = date.getDay();
        let dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return dayNames[index];
    },

    /**
     * 返回星期数
     */
    getMonthPreDay: function(year, month) {
        let date = new Date(year + '/' + month + '/01');
        let day = date.getDay();
        if (day === 0) {
            day = 7;
        }
        return day;
    },

    /**
     * 返回月份天数
     */
    getMonthDays: function(year, month) {
        if (/^0/.test(month)) {
            month = month.split('')[1];
        }
        return [0, 31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    /**
     * 补齐数字位数
     */
    getNumTwoBit: function(n) {
        n = Number(n);
        return (n > 9 ? '' : '0') + n;
    },

    /**
     * 日期对象转成字符串
     */
    date2Str: function(date, split) {
        if (typeof date == 'string') return date;
        split = split || '-';
        let y = date.getFullYear();
        let m = this.getNumTwoBit(date.getMonth() + 1);
        let d = this.getNumTwoBit(date.getDate());
        return [y, m, d].join(split);
    },

    /**
     * 返回日期格式字符串
     */
    getDay: function(i) {
        i = i || 0;
        let date = new Date();
        let diff = i * (1000 * 60 * 60 * 24);
        date = new Date(date.getTime() + diff);
        return this.date2Str(date);
    },

    /**
     * 时间戳转换为日期格式
     */
    timestampToDate: function(timestamp) {
        let date = new Date(timestamp);
        return date.getFullYear() + '-' + this.getNumTwoBit(date.getMonth() + 1) + '-' + this.getNumTwoBit(date.getDate());
    },

    /**
     * 时间比较
     */
    compareDate: function(date1, date2) {
        let startTime = new Date(date1.replace('-', '/').replace('-', '/'));
        let endTime = new Date(date2.replace('-', '/').replace('-', '/'));
        if (startTime >= endTime) {
            return false;
        }
        return true;
    },

    /**
     * 时间比较
     */
    compareDateArr: function(date1, date2) {
        let startTime = new Date();
        startTime.setFullYear(parseInt(date1[0]), parseInt(date1[1]) - 1, parseInt(date1[2]));
        startTime.setHours(parseInt(date1[3]), parseInt(date1[4]));
        let endTime = new Date();
        endTime.setFullYear(parseInt(date2[0]), parseInt(date2[1]) - 1, parseInt(date2[2]));
        endTime.setHours(parseInt(date2[3]), parseInt(date2[4]));
        return startTime < endTime;

    },

    /**
     * 时间是否相等
     */
    isEqual: function(date1, date2) {
        let startTime = new Date(date1).getTime();
        let endTime = new Date(date2).getTime();
        if (startTime === endTime) {
            return true;
        }
        return false;
    },

    /**
     * 数组化数据
     * @param str
     * @returns {(*|string)[]}
     */
    getDateArr(str) {
        return [this.getYear(str), this.getMonth(str), this.getDate(str), this.getHour(str), this.getMinute(str)];
    },

    /**
     * 匹配时间格式或者日期格式的字符串
     * @param str
     * @returns {boolean}
     */
    isDateString(str) {
        // 匹配 YYYY-MM-DD、YYYY/MM/DD 或 YYYY.MM.DD
        let date = /\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/.test(str)
        // 匹配 YYYY-MM、YYYY/MM 或 YYYY.MM
        let time = /^([01][0-9]|2[0-3])(:[0-5][0-9]){1,2}$/.test(str);
        // 匹配 HH:MM 或 HH:MM:SS



        // 匹配YYYY
        let year = /\d{4}/.test(str)
        // 匹配YYYY-MM，YYYY/MM 或YYYY.MM
        let year_month = /\d{4}(\-|\/|.)\d{1,2}/.test(str)

        // 匹配MM-DD, M-DD, MM-D, 间隔为/ 间隔为.
        let month_day = /\d{1,2}(\-|\/|.)\d{1,2}/.test(str)

        return date || time || year || year_month || month_day;
    },

    // 需要改，当选择month-day时，自动传入当年的年份
    /**
     *
     * @param value
     * @returns {*|number}
     */
    getYear(value) {
        return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[0] : value.getFullYear();
    },

    /**
     *
     * @param value
     * @returns {*}
     */
    getMonth(value) {
        return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[1] : value.getMonth() + 1;
    },

    /**
     * 返回匹配到的自然日数据， 如果没有，则返回每个月的第一个自然日
     * @param value
     * @returns {*}
     */
    getDate(value) {
        if (this.isDateString(value)) {
            return value.split(' ')[0].split(/-|\/|\./)[2] || '01'
        }
        return value.getDate();
    },

    /**
     *
     * @param value
     * @returns {string|*}
     */
    getHour(value) {
        if (this.isDateString(value)) {
            const str = value.split(' ')[1] || '00:00:00';
            return str.split(':')[0];
        }
        return value.getHours();
    },

    /**
     *
     * @param value
     * @returns {string|*}
     */
    getMinute(value) {
        if (this.isDateString(value)) {
            const str = value.split(' ')[1] || '00:00:00';
            return str.split(':')[1];
        }
        return value.getMinutes();
    }
};

export default Utils;
