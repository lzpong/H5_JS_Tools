(function(t){
    var ONE_DAY = 1000*3600*24;

    //month & week's array
    var fullMonthName = ['January', 'February', 'March', 'April', 'May', 'June','July','August', 'September', 'October', 'November', 'December'],
        fullWeekName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        /**
         * 添前导0
         * @inner
         */
            fillZero = function (num) {
            return num < 10 ? '0' + num : num;
        },
        /**
         * 计算时间差距，毫秒
         * @inner
         */
            timeDist = function(date1, date2) {
            date2 = date2 || new Date(date1.getFullYear(), 0, 1);
            return date1 - date2;
        },
    // 若添加更多格式，开发只需在pri中加上即可
        pri = {
            // d: 月份中的第几天，有前导零的 2位数字，01 到 31
            d : function (d) {
                return fillZero(this.j(d));
            },
            // D：星期中的第几天，文本表示，3个字母，Mon 到 Sun
            D : function (d) {
                return this.l(d).substr(0, 3);
            },
            // j:月份中的第几天，没有前导零，1 到 31
            j : function (d) {
                return d.getDate();
            },
            // l: 星期几，完整的文本格式，Sunday 到 Saturday
            l : function (d) {
                return fullWeekName[d.getDay()];
            },
            // N：ISO-8601 格式数字表示的星期中的第几天，1（表示星期一）到 7（表示星期天）
            N: function (d) {
                return this.w(d) || 7;
            },
            // w：星期中的第几天，数字表示，0（表示星期天）到 6（表示星期六）
            w : function (d) {
                return d.getDay();
            },
            // z: 一年中的第几天，0 到 366
            z : function (d){
                return Math.floor(timeDist(d) / 86400000);
            },
            // F：月份，完整的文本格式，例如 January 或者 March，January 到 December
            F : function (d) {
                return fullMonthName[d.getMonth()];
            },
            // m：数字表示的月份，有前导零， 01 到 12
            m : function (d) {
                return fillZero(this.n(d));
            },
            // n：数字表示的月份，没有前导零，1 到 12
            n : function (d) {
                return d.getMonth() + 1;
            },
            // M：三个字母缩写表示的月份，Jan 到 Dec
            M : function (d) {
                return this.F(d).substr(0, 3);
            },
            // Y：4 位数字表示的年份
            Y : function (d) {
                return d.getFullYear();
            },
            // y：2 位数字表示的年份
            y : function (d) {
                return this.Y(d).toString().slice(-2);
            },
            // a：显示am/pm
            a : function (d) {
                return d.getHours() < 12 ? 'am' : 'pm';
            },
            // A：显示AM/PM
            A : function (d) {
                return this.a(d).toUpperCase();
            },
            // g：小时，12 小时格式，没有前导零，1 到 12
            g : function (d) {
                return d.getHours() % 12 || 12;
            },
            // G：小时，24 小时格式，没有前导零，0 到 23
            G : function (d) {
                return d.getHours();
            },
            // h：小时，12 小时格式，有前导零，01 到 12
            h : function (d) {
                return fillZero(this.g(d));
            },
            // H：小时，24 小时格式，有前导零，00 到 23
            H : function (d) {
                return fillZero(this.G(d));
            },
            // i：有前导零的分钟数，00 到 59
            i : function (d) {
                return fillZero(d.getMinutes());
            },
            // s：秒数，有前导零，00 到 59
            s : function (d) {
                return fillZero(d.getSeconds());
            }
        };

    /**
     * Date enhancement tools
     * @class dateTool
     * @namespace lang
     * @module lang
     */
    var dateTool = {
        /**
         * 格式化日期为字符串
         * @method format
         * @param {String} expr 表达式
         * @param {Number|Date} [date=new Date()] 日期
         * @return {String} 字符串
         * @example
         *      format参数如下（来源于PHP的date函数的参数子集）：
         *	    日期：
         *		    d：月份中的第几天，有前导零的 2位数字，01 到 31
         *		    D：星期中的第几天，文本表示，3个字母，Mon 到 Sun
         *		    j：月份中的第几天，没有前导零，1 到 31
         *		    l: 星期几，完整的文本格式，Sunday 到 Saturday
         *		    N：ISO-8601 格式数字表示的星期中的第几天，1（表示星期一）到 7（表示星期天）
         *		    w：星期中的第几天，数字表示，0（表示星期天）到 6（表示星期六）
         *		    z: 一年中的第几天，0 到 366
         *	    月份：
         *		    F：月份，完整的文本格式，例如 January 或者 March，January 到 December
         *		    m：数字表示的月份，有前导零， 01 到 12
         *		    n：数字表示的月份，没有前导零，1 到 12
         *		    M：三个字母缩写表示的月份，Jan 到 Dec
         *	    年份：
         *		    Y：4 位数字表示的年份
         *		    y：2 位数字表示的年份
         *	    上下午标识：
         *		    a：显示am/pm
         *		    A：显示AM/PM
         *	    小时：
         *		    g：小时，12 小时格式，没有前导零，1 到 12
         *		    G：小时，24 小时格式，没有前导零，0 到 23
         *		    h：小时，12 小时格式，有前导零，01 到 12
         *		    H：小时，24 小时格式，有前导零，00 到 23
         *	    分钟：
         *		    i：有前导零的分钟数，00 到 59
         *	    秒数：
         *		    s：秒数，有前导零，00 到 59
         * @example
         *      date.format('Y-m-d H:i:s A l'); // output:2012-04-19 15:17:56 AM Thursday
         *      date.format('Y年m月d日 H:i:s A l'); // output:2012年04月19日 15:18:38 AM Thursday
         *      date.format('\\Y是Y'); // output:Y是2012
         */
        format: function(expr, date){
            expr = expr || 'Y-m-d H:i:s';

            if (arguments.length == 1) {
                date = new Date();
            } else if(!(date instanceof Date)){
                date = new Date(parseInt(date) || 0);
            }
            return expr.replace(/\\?([a-z])/gi, function(str, $1) {
                if (pri[str]) {
                    return pri[str].call(pri, date);
                } else {
                    return $1;
                }
            });
        },

        /**
         * Is The year a leap year
         * @method isLeapYear
         * @param {Date|String} year
         * @return {boolean}
         * @example
         *      dateTool.isLeapYear('2000'); // true
         *      dateTool.isLeapYear(new Date()); // it depends
         */
        isLeapYear : function(year){
            year.getTime && (year = dateTool.format('Y', year));
            year = parseInt(year, 10);
            return !!(0 == year % 4 && ((year % 100 != 0) || (year % 400 == 0)));
        },

        /**
         * Get last date ( One day before the given date ).
         * @method lastDay
         * @param {Date|Number} date
         * @return {Date}
         * @example
         *      dateTool.lastDay(new Date()); // returns yesterday
         *      dateTool.lastDay(new Date('2000-1-10')); // returns new Date('2000-1-9')
         */
        lastDay: function(date){
            return new Date(+date - ONE_DAY);
        },

        /**
         * Get date of the next day
         * @method nextDay
         * @param {Date|Number} date
         * @return {Date}
         * @example
         *      dateTool.lastDay(new Date()); // returns tomorrow
         *      dateTool.lastDay(new Date('2000-1-10')); // returns new Date('2000-1-11')
         */
        nextDay: function(date){
            return new Date(+date + ONE_DAY);
        },

        /**
         * Get the date of the day one month before
         * @method lastMonth
         * @param {Date|Number} date
         * @return {Date}
         * @example
         *      dateTool.lastDay(new Date()); // returns one month ago
         *      dateTool.lastDay(new Date('2000-1-10')); // returns new Date('1999-12-10')
         */
        lastMonth: function(date){
            var cloned = new Date(+date);
            cloned.setMonth(cloned.getMonth() - 1);
            return cloned;
        },

        /**
         * Get the date of the day in next month
         * @method nextMonth
         * @param {Date|Number} date
         * @return {Date}
         * @example
         *      dateTool.nextMonth(new Date()); // returns one month later
         *      dateTool.nextMonth(new Date('2000-1-10')); // returns new Date('2000-2-10')
         */
        nextMonth: function(date){
            var cloned = new Date(+date);
            cloned.setMonth(cloned.getMonth() + 1);
            return cloned;
        },

        /**
         * Get date of the day one year before
         * @method lastYear
         * @param {Date|Number} date
         * @return {Date}
         * @example
         *      dateTool.lastYear(new Date()); // returns one year ago
         *      dateTool.lastYear(new Date('2000-1-10')); // returns new Date('1999-1-10')
         */
        lastYear: function(date){
            var cloned = new Date(+date);
            cloned.setYear(cloned.getFullYear() - 1);
            return cloned;
        },

        /**
         * Get date of the day in next year
         * @method nextYear
         * @param {Date|Number} date
         * @return {Date}
         * @example
         *      dateTool.nextYear(new Date()); // returns one year later
         *      dateTool.nextYear(new Date('2000-1-10')); // returns new Date('2001-1-10')
         */
        nextYear: function(date){
            var cloned = new Date(+date);
            cloned.setYear(cloned.getFullYear() + 1);
            return cloned;
        },

        /**
         * Get days between two date
         * @method daysBetween
         * @param {Date|Number} start Accept date object or timestamp ( in ms )
         * @param {Date|Number} end Accept date object or timestamp ( in ms )
         * @return {Number} if end date is before start date, returns a negative int
         * @example
         *      dateTool.daysBetween(new Date('2000-1-10'), new Date('2000-1-20')); // returns 10
         *      // when start date is later than end date returns negative int
         *      dateTool.daysBetween(new Date('2000-1-20'), new Date('2000-1-10')); // returns -10
         */
        daysBetween: function(start, end){
		    // bug fix see https://github.com/lbfteam/lbf-doc/issues/5
			var timeZoneExtTime = new Date().getTimezoneOffset() * 60 * 1000; // in ms
            return parseInt((+end - timeZoneExtTime) / ONE_DAY, 10) - parseInt((+start -timeZoneExtTime) / ONE_DAY, 10)
        },

        /**
         * Check if two time are in the same day
         * Note that we should reset the two days to the 00:00:00 of the day to check if they are the same day
         * @param {Date|Number} date1 Accept date object or timestamp ( in ms )
         * @param {Date|Number} date2 Accept date object or timestamp ( in ms )
         * @return {Boolean}
         * @example
         *      var date1 = 1369808162919, // Wed May 29 2013 14:16:02 GMT+0800 (中国标准时间)
         *          date2 = 1369800000000; // Wed May 29 2013 12:00:00 GMT+0800 (中国标准时间)
         *      dateTool.isSameDay(date1, date2); // returns true
         */
        isSameDay: function(date1, date2){
            date1 = new Date(date1);
            date2 = new Date(date2);
            date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
            date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
            return dateTool.daysBetween(date1, date2) === 0;
        },

        /**
         * Get timestamp in second. Usually for syncing with server
         * @method timestamp
         * @param {Date|Number} date
         * @return {Number}
         * @example
         *      dateTool.timestamp(new Date(1369808162919)); // returns 1369808162
         */
        timestamp: function(date){
            return parseInt(+date / 1000, 10);
        }
    };

    t.dateTool = dateTool;
})(this);