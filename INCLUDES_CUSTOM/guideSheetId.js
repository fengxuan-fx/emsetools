function guideSheetId(id){

var j = id;
var guideID;
if(j < 10){
guideID = "00" + j;
}
else if(j >= 10 && j < 100){
guideID = "0" + j;
}
else if(j >= 100 && j <1000){
guideID = j;
}

return guideID;

}