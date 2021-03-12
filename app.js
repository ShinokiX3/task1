const fs = require('fs'),
      path = require('path'),
      csv = require('csv-parser'),
      createCsvWriter = require('csv-writer').createObjectCsvWriter;

// GET CSV FILE'S DATA

const results = [], newResArr = [];
fs.createReadStream('./csv_files/acme_worksheet.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    setSummaryTables();
  });

function findAllDates() {
    const dates = [];
    for (let i = 0; i < results.length; i++) {
        let date = results[i].Date;
        if (dates.findIndex(item => {
            return item == date; }) == -1) {
                dates.push(date);
        }
    }
    return dates;
}

function findIndecesOfGuy(currGuy) {
    const indeces = [];
    results.forEach((item, index) => {
        if (item['Employee Name'] == currGuy) {
            indeces.push(index);
        }
    });
    return indeces;
}

function pushInfo(dates, guyIndeces, currGuy) {
    newResArr.push({});
    newResArr[newResArr.length-1]['Name/Date'] = currGuy;
    dates.forEach(date => {
        guyIndeces.forEach(index => {
            if (results[index].Date == date) {
                newResArr[newResArr.length-1][date] = results[index]['Work Hours'];
            } else if (index == guyIndeces[guyIndeces.length-1] &&
                       !newResArr[newResArr.length-1][date]) {
                newResArr[newResArr.length-1][date] = 0;
            }
        });
    });
}

function setSummaryTables() {
    const dates = findAllDates();
    for (let i = 0; i < results.length; i++) {
        let currGuy = results[i]['Employee Name'];
        if (newResArr.findIndex(item => {
            return item['Name/Date'] == currGuy; }) == -1) {
            const guyIndeces = findIndecesOfGuy(currGuy);
            pushInfo(dates, guyIndeces, currGuy);
        }
    }
    createResultFile(dates);
}

function correctDate(date) {
    let yy = date.getFullYear()+'';
    yy = yy.length == 1 ? '0'+yy : yy;
    let mm = date.getMonth()+1+'';
    mm = mm.length == 1 ? '0'+mm : mm;
    let dd = date.getDate()+'';
    dd = dd.length == 1 ? '0'+dd : dd;
    return `${yy}.${mm}.${dd}`;
}

// WRITE CSV FILE

function createResultFile(dates) {
    const header = [];
    header.push({id: 'Name/Date', title: 'Name/Date'});
    dates.forEach(date => {
        let titleDate = correctDate(new Date(date));
        header.push({id: date, title: titleDate});
    });
    const csvWriter = createCsvWriter({
        path: './csv_files/new_result-file.csv',
        header: header
    });
    csvWriter.writeRecords(newResArr)
    .then(() => {
        console.log('...Done');
    });
}