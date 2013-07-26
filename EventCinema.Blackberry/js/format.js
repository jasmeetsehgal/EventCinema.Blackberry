var FORMAT = {
    string: {
        trimChars: function (str, chars) {
            if (str != null) {
                if (str.length > chars) {
                    var newstr = str.substring(0, chars - 4) + " ...";
                    return (newstr);
                } else {
                    return (str);
                }
            } else {
                return "";
            }
        },

        trimSpaceAndNewline: function(str){
            str = str.replace(/[\n\r]/g, '');
            return str;
        },
        substringValue: function (str, maxLength) {
            if (str.length > maxLength) {
                return str.substring(0, maxLength);
            } else {
                return str;
            }
        }
    },
   
    int: {
        formatDistance: function (distance) {
            return distance.toFixed(0) + " km";
        },

        //http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
        fillZeroes: "00000000000000000000",
        zeroFill: function(number, width) {
            var input = number + "";  // make sure it's a string
            return (FORMAT.int.fillZeroes.slice(0, width - input.length) + input);
        }
    },

    date: {
        days: new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"),
        months: new Array("Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"),
        formatDDDDddMMM: function (date) {
            var currDay = date.getDay();
            var currMonth = date.getMonth();
            var currDate = date.getDate();
            return FORMAT.date.days[currDay] + " " + currDate + " " + FORMAT.date.months[currMonth];
        },
        parseJsonDate: function (dateStr) {
            var date = null;
            if (dateStr != null) {
                var dateStr = dateStr.replace(/\//g, "")
                    .replace(/Date\(/g, "")
                    .replace(/\)/g, "");
                var dateInt = parseInt(dateStr);
                date = new Date(dateInt);
            }
            return date;
        },
        formatYYYY_MM_DD: function (date) {
            var currDay = date.getDay();
            var currMonth = date.getMonth() + 1;
            var currDate = date.getDate();
            
            return date.getFullYear() + "-" + FORMAT.int.zeroFill(currMonth, 2) + "-" + currDate;
        },
        formatHH_MM: function (date) {
            return FORMAT.int.zeroFill(date.getHours(), 2) + ":" + FORMAT.int.zeroFill(date.getMinutes(), 2);
        },
        formatDD_MM: function (date) {
            var currDay = date.getDate();
            var currMonth = date.getMonth() + 1;

            return FORMAT.int.zeroFill(currDay, 2) + "/" + FORMAT.int.zeroFill(currMonth, 2);
        },
        formatDD_MMM_YYYY: function (date) {
            var currDay = date.getDate();
            var currMonth = date.getMonth() + 1;
            var currYear = date.getFullYear();

            return FORMAT.int.zeroFill(currDay, 2) + " " + FORMAT.date.months[currMonth] + " " + currYear;
        },
        isToday: function (date) {
            var sessionDay = date.getDate();
            var sessionMonth = date.getMonth() + 1;
            var sessionYear = date.getFullYear();

            var currDate = new Date();
            var currDay = currDate.getDate();
            var currMonth = currDate.getMonth() + 1;
            var currYear = currDate.getFullYear();

            if (sessionDay == currDay && sessionMonth == currMonth && sessionYear && currYear) {
                return true;
            } else {
                return false;
            }
 
        }
        
    }
};