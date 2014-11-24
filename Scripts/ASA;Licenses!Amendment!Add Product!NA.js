if (AInfo['Do any of your products contain plant nutrients?'] == "Yes" && !appHasCondition("License Checklist","Applied","Commercial Fertilizer License Required","Required")) {
	addStdCondition("License Checklist","Commercial Fertilizer License Required");
	}

if(feeExists("PLNT_SPI")) removeFee("PLNT_SPI","FINAL");
//updateFee("PLNT_SPI","PLNT_SPI","FINAL",0,"N");
if(!feeExists("PLNT_SPI")) calculateLicenseFees();