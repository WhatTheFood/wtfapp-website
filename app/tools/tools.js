
exports.getDayDate = function() {
    var date = new Date();
    var month = date.getMonth() + 1; //months from 1-12
    var day = date.getDate();
    var year = date.getFullYear();

    newdate = day + "/" + month + "/" + year;

    return newdate;
}
