function totalVolume(){
totalAmt = 0;
if (typeof(PURCHASINGMILKFROM) == "object") {
	for(x in PURCHASINGMILKFROM) totalAmt+=parseFloat(PURCHASINGMILKFROM[x]["Estimated Monthly Volume(Lbs.)"]);
	//logDebug("Total Amount" + totalAmt);
	editAppSpecific("Total Volume Purchased",totalAmt.toString());
	}
	}