if(feeExists("PLNT_GRDL_01")) removeFee("PLNT_GRDL_01","FINAL");
sl = getAppSpecific("Does the Main Location deal in selling plants?");
if (sl=="Yes") {
	addLocCount = 1;
	} else {
	addLocCount = 2;
	}

ca = getContactArray();

if (ca) {
	for (x in ca) if (ca[x] ["contactType"] == "Additional Location") addLocCount++;
	}
