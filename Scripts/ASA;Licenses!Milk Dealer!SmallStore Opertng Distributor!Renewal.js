
//totalPounds();
//var total = parseFloat(AInfo['Monthly sale (Pounds)']) + parseFloat(AInfo['Total Volume Purchased']);
//if (!partialCap) {
//	editAppSpecific("Total Volume",total.toString());
	//}

if(feeExists("MILK_SST_RNW")) removeFee("MILK_SST_RNW","FINAL");
if (publicUser) {
	addFee("MILK_SST_RNW","MILK_SMALLSTORE_R","FINAL",calcMilkDlrLicenseFee(AInfo['Average Daily Quantity']),"Y");
	}
	
//totalVolume();
//var total = parseFloat(AInfo['Monthly sale (Pounds)']) + parseFloat(AInfo['Total Volume Purchased']);
//editAppSpecific("Total Volume",total.toString());
//if(feeExists("MILK_VOL")) removeFee("MILK_VOL","FINAL");
//if (publicUser) {
//	addFee("MILK_VOL","MILK_DLR","FINAL",calcMilkDlrLicenseFee(AInfo['Total Volume']),"Y");
//	}