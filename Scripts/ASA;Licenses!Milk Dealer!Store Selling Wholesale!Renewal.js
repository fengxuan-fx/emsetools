//totalVolume();
//var total = parseFloat(AInfo['Monthly sale (Pounds)']) + parseFloat(AInfo['Total Volume Purchased']);
//editAppSpecific("Total Volume",total.toString());
if(feeExists("MILK_WS_RNW")) removeFee("MILK_WS_RNW","FINAL");
if (publicUser) {
	addFee("MILK_WS_RNW","MILK_WS_DIS_R","FINAL",calcMilkDlrLicenseFee(AInfo['Average Daily Quantity']),"Y");
	}
