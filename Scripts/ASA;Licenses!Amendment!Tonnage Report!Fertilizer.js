
var tTon = AInfo["January - December Total Tons"];

if(!publicUser){
	
	if(feeExists("PLNT_TON")) removeFee("PLNT_TON","FINAL");
	if (AInfo["January - December Total Tons"] == 0 || AInfo["January - December Total Tons"] == null) 
	{

		var totalAmt =0;
		var tonnageFee =0;
		if (typeof(TONNAGEDETAILS) == "object") {
			for(x in TONNAGEDETAILS) {
				if (TONNAGEDETAILS[x]["Fee Code"] == "Fee Applies"){
					(totalAmt = totalAmt + parseFloat(TONNAGEDETAILS[x]["Quantity"]))};
				}
			}
		logDebug("Quantity Value" + totalAmt);
		var asiTotal = totalAmt + ' ';
		editAppSpecific("January - December Total Tons",asiTotal);
		var test = AInfo['January - December Total Tons'];
		
			if(parseFloat(totalAmt) == 0)
			{
				
				addFee("PLNT_TON","TONNAGE","FINAL",test,"Y");
			}
			else if(parseFloat(totalAmt) < 500 && parseFloat(totalAmt) != 0)
			{
				
				addFee("PLNT_TON","TONNAGE","FINAL",test,"Y");
			}	
			else if(parseFloat(totalAmt) >= 500)
			{	
				
				addFee("PLNT_TON","TONNAGE","FINAL",test,"Y");
			}	
		
	}
	else
	{
		addFee("PLNT_TON","TONNAGE","FINAL",tTon,"Y");
	}
}

if(publicUser){
if(feeExists("PLNT_TON")) removeFee("PLNT_TON","FINAL");

addFee("PLNT_TON","TONNAGE","FINAL",tTon,"Y");


}


