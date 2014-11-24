if(feeExists("MILK_SST_RNW")) removeFee("MILK_SST_RNW","FINAL");
//totalVolume();
//var total = parseFloat(AInfo['Monthly sale (Pounds)']) + parseFloat(AInfo['Total Volume Purchased']);
//editAppSpecific("Total Volume",total.toString());
totalPounds();
var tp = AInfo['Total Pounds Purchased Weekly'];
var adq = parseFloat(tp)
var adqDiv = adq/7;
var dailyQuantity = adqDiv + ' ';
editAppSpecific("Average Daily Quantity", dailyQuantity);

if (!publicUser) {
	addFee("MILK_SST_RNW","MILK_SMALLSTORE_R","FINAL",calcMilkDlrLicenseFee(AInfo['Average Daily Quantity']),"Y");
	}