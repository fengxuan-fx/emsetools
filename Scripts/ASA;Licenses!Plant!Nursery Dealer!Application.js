sl = getAppSpecific("Does the Main Location deal in selling plants?");
if (sl=="Yes") {
	addLocCount = 1;
	} else {
	addLocCount = 0;
	}

ca = getContactArray();
if (ca) {
	for (x in ca) if (ca[x] ["contactType"] == "Additional Location") addLocCount++;
	}

if (addLocCount > 0) {
	if(!feeExists("PLNT_GRDL_01")) addFee("PLNT_GRDL_01","PLNT_GRDLR","FINAL",addLocCount,"Y");
	}
