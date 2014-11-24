lime = loadASITable("LIME BRAND");
addlimeCount = 0;
if (lime) {
	for (x in lime) addlimeCount++;
	}

if (addlimeCount > 0) {
	removeFee("PLNT_AGLIM","FINAL");
	addFee("PLNT_AGLIM","PLNT_AGLIM","FINAL",addlimeCount,"Y");
	}
	
	var feeObj = aa.finance.getFeeItemByCapID(capId);
	feeObj = feeObj.getOutput();
	for(x in feeObj)
	{
		logDebug(feeObj[x].getFee() + " " + feeObj[x].getFeeCod() + " " + feeObj[x].getFeeDescription());
	}