var blnValidLics = false;
if (AInfo['Are You Currently Licensed As A Commercial Fertilizer Distributor?'] == "Yes") {
	blnValidLics = validateComFertilizerLicenseNum(AInfo['Enter License number here']);
	}

