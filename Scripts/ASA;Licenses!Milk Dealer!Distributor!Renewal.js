//totalvolume();
//var total = parseFloat(AInfo['Monthly sale (Pounds)']) + parseFloat(AInfo['Total Volume Purchased']);
//if (!partialCap) {
//editAppSpecific("Total Volume",total.toString());
	//}

if(feeExists("MILK_DLR_R")) removeFee("MILK_DLR_R","FINAL");
if (publicUser) {
	addFee("MILK_DLR_R","MILK_DLR_R","FINAL",calcMilkDlrLicenseFee(AInfo['Average Daily Quantity']),"Y");
	}