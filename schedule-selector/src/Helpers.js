const combineDate = (t1, t2) => {
    if(t1['month'] !== t2['month'])
        return null;
    if(t1.day !== t2.day)
        return null;
    if(t1.endTime === t2.startTime)
        return {
            'month': t1.month,
            'day': t1.day,
            'dayOfWeek': t1.dayOfWeek,
            'startTime' : t1.startTime,
            'duration' : t1.duration + t2.duration,
            'endTime' : t2.endTime,
            'startTimeMinutes' : t1.startTimeMinutes,
            'endTimeMinutes' : t2.endTimeMinutes
        };
    else
        return null;
  }

function prepareDateArray(schedule) {
  schedule.sort();
  const convertedArray = [];
  for(var i = 0; i < schedule.length; i++){
      var date = schedule[i];
      const month = date.getMonth() + 1; // Adding 1 to get 1-indexed month
      const day = date.getDate();
      const dayOfWeek = date.getDay(); // Returns 0 (Sunday) to 6 (Saturday)
      const startTime = `${date.getHours()}:${date.getMinutes()}`;
      const duration = 30;
      const endDate = new Date(date.getTime() + duration*60000);
      const endTime = `${endDate.getHours()}:${endDate.getMinutes()}`;
      const startTimeMinutes = date.getHours() * 60 + date.getMinutes();
      const endTimeMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      convertedArray.push ( {
          'month': month,
          'day': day,
          'dayOfWeek': dayOfWeek,
          'startTime' : startTime,
          'duration' : duration,
          'endTime' : endTime,
          'startTimeMinutes' : startTimeMinutes,
          'endTimeMinutes' : endTimeMinutes
      });
  }
  convertedArray.sort(function(x, y) {
      if(x.month < y.month) {
          return -1;
      } else if (x.month > y.month) {
          return 1;
      }
      if(x.day < y.day) {
          return -1;
      } else if (x.day > y.day) {
          return 1;
      }
      if(x.startTime < y.startTime) {
          return -1;
      } else if (y.startTime > x.startTime) {
          return 1;
      }
      return 0;
  });
  var t1  = convertedArray[0];
  var t2 = convertedArray[1];
  var c = null;
  var combinedArray = [];
  for(i = 1; i < convertedArray.length; i++) {
      t2 = convertedArray[i];
      c = combineDate(t1, t2);
      if(c == null) {
          combinedArray.push(t1);
          t1 = convertedArray[i];
      } else {
          t1 = c;
      }
  }
  combinedArray.push(t1);
  combinedArray.sort(function(x, y) {
      if(x.duration > y.duration) {
        return -1;
      } else if (x.duration < y.duration) {
        return 1;
      }
      return 0;
  });
}


