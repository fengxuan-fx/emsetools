var blnValidLics = false;
if (AInfo['Are You Currently Licensed As A Commercial Fertilizer Distributor?'] == "Yes") {
	blnValidLics = validateComFertilizerLicenseNum(AInfo['Enter License number here']);
	logDebug("GOT IT");
	}

if (blnValidLics) {
	waveLicenseFee();
	// if they have valid Licenses/Plant/Commercial Fertilizer/License wave all the fees;
	logDebug("Smashed that fee!");
	}