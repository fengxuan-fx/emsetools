logDebug("Licenses Milk Stat Calculations");

if (wfTask == "Application Intake" && wfStatus == "Received") 
{
	if(appMatch("Licenses/Amendment/Milk Statistical Report/Milk Statistical OOS Report")){
	logDebug("Record is of the type Milk OOS Report");
	var schedHOOS = loadASITable("SCHEDULE H - SALE ON ROUTES");
	if(schedHOOS)
	{
		var totalAmt =0;

		if (typeof(schedHOOS) == "object")
		{
			for(x in schedHOOS) {(totalAmt = totalAmt + parseFloat(schedHOOS[x]["Lbs of Milk or Cream Product Sold"]))};
		}

		logDebug("Total AMount SALE ON ROUTE" + totalAmt);
		var tAmt = totalAmt + ' ';
		editAppSpecific("Total Lbs of Milk or Cream Product Sold",tAmt);
	}
	
	var schedDStatOOS = loadASITable("SCHEDULE D - SALES OF MILK");
	if (schedDStatOOS){

	
	var poundsOfProducts=0;
	var poundsOfButterfat=0;
	
	if (typeof(schedDStatOOS) == "object") {
		
		for(k in schedDStatOOS) {(poundsOfProducts = poundsOfProducts + parseFloat(schedDStatOOS[k]["NYS Pounds of Product"]))};
		for(l in schedDStatOOS) {(poundsOfButterfat = poundsOfButterfat + parseFloat(schedDStatOOS[l]["NYS Pounds of Butterfat"]))};
	}
	
	logDebug("Total NYS Pounds of Products: " + poundsOfProducts);
	var tPoundsOfDairyProducts = poundsOfProducts + ' ';
	
	logDebug("Total NYS Pounds of Butterfat: " + poundsOfButterfat);
	var tPoundsOfButterfat = poundsOfButterfat + ' ';
	
	editAppSpecific("NYS Pounds of Dairy Products",  tPoundsOfDairyProducts);
	editAppSpecific("NYS Pounds of Butterfat", tPoundsOfButterfat);	
	}
	
	}
	
	if(appMatch("Licenses/Amendment/Milk Statistical Report/Milk Statistical BTU Report")){
	
	var schedS = loadASITable("SCHEDULE S - SHIPMENT TO PLANT");
	if(schedS){
	var totalAmt =0;
	var totalProd =0;
	if (typeof(schedS) == "object") {
	for(x in schedS) {(totalAmt = totalAmt + parseFloat(schedS[x]["Pounds of Butterfat"]))};
	for(y in schedS) {(totalProd = totalProd + parseFloat(schedS[y]["Pounds of Products"]))};
	}
	logDebug("Total Butterfat - Sched S" + totalAmt);
	var tButterfat = totalAmt + ' ';
	logDebug("Total Products - Sched S" + totalProd);
	var tProd = totalProd + ' ';

	editAppSpecific("Total Lbs of Butterfat",tButterfat);
	editAppSpecific("Total Lbs of Milk",tProd);
	}
	
	var scheDeductionsBTU = loadASITable("DEDUCTIONS");
	if(scheDeductionsBTU)
	{
		var totalAmt =0;
		if (typeof(scheDeductionsBTU) == "object") 
		{
			for(i in scheDeductionsBTU) {(totalAmt = totalAmt + parseFloat(scheDeductionsBTU[i]["Amount ($)"]))};
		}
	
		logDebug("Total AMount Deductions" + totalAmt);
		var tAmt = totalAmt + ' ';
		editAppSpecific("Total Deductions",tAmt);	
	}
	
	}

	
	if(appMatch("Licenses/Amendment/Milk Statistical Report/NA")){
	var schedB = loadASITable("SCHEDULE B - OTHER SOURCES");
	if(schedB)
	{
		var totalAmt = 0;
		var totalprod = 0;
		var totalfat = 0;
		var totalNfat = 0;
		if (typeof(schedB) == "object") 
		{
			for(x in schedB)if (schedB[x]["State Plant is Located"] == "NY") {(totalAmt = totalAmt + parseFloat(schedB[x]["Pounds of Products"]))};
			for(y in schedB)if (schedB[y]["State Plant is Located"] != "NY") {(totalprod = totalprod + parseFloat(schedB[y]["Pounds of Products"]))};
			for(z in schedB)if (schedB[z]["State Plant is Located"] != "NY") {(totalfat = totalfat + parseFloat(schedB[z]["Pounds of Butterfat"]))};
			for(a in schedB)if (schedB[a]["State Plant is Located"] == "NY") {(totalNfat = totalNfat + parseFloat(schedB[a]["Pounds of Butterfat"]))};
		}

	
		var tAmt = totalAmt + ' ';
		var tProd = totalprod + ' ';
		var tfat = totalfat + ' ';
		var tNfat = totalNfat + ' ';
		
		editAppSpecific("Total Pounds of Product from NYS",tAmt);
		editAppSpecific("Total Pounds of Product from OOS",tProd);
		editAppSpecific("Total Pounds of Butterfat from NYS",tNfat);
		editAppSpecific("Total Pounds of Butterfat from OOS",tfat);
	}

	var schedE = loadASITable("SCHEDULE E - OTHER DISPOSITION");

	if(schedE)
	{
		var totalAmt =0;

		if (typeof(schedE) == "object") 
		{
			for(x in schedE) {(totalAmt = totalAmt + parseFloat(schedE[x]["Pounds of Product"]))};
		}
		logDebug("Total AMount OTHER DISPOSITION" + totalAmt);
		
		var tAmt = totalAmt + ' ';
		editAppSpecific("Total Lbs of Product Disposed",tAmt);
	}	

	var schedEPlant = loadASITable("SCHEDULE E- SHIPMENT TO PLANTS");
	if(schedEPlant)
	{
		var totalFat =0;
		var totalProd =0;
		if (typeof(schedEPlant) == "object") 
		{
			for(y in schedEPlant) {(totalFat = totalFat + parseFloat(schedEPlant[y]["Pounds of Butterfat"]))};
			for(z in schedEPlant) {(totalProd = totalProd + parseFloat(schedEPlant[z]["Pounds of Product"]))};
		}
	
		logDebug("Total Product Shipment to plants" + totalProd);
		var tProd = totalProd + ' ';
		logDebug("Total FAt SHIP" + totalFat);
		var tfat = totalFat + ' ';

		editAppSpecific("Total Lbs of Product",tProd);	
		editAppSpecific("Total Lbs of Butterfat",tfat);

	}

	var schedH = loadASITable("SCHEDULE H - SALE ON ROUTES");
	if(schedH)
	{
		var totalAmt =0;

		if (typeof(schedH) == "object")
		{
			for(x in schedH) {(totalAmt = totalAmt + parseFloat(schedH[x]["Lbs of Milk or Cream Product Sold"]))};
		}

		logDebug("Total AMount SALE ON ROUTE" + totalAmt);
		var tAmt = totalAmt + ' ';
		editAppSpecific("Total Lbs of Milk or Cream Product Sold",tAmt);
	}

	var scheDeductions = loadASITable("DEDUCTIONS");
	if(scheDeductions)
	{
		var totalAmt =0;
		if (typeof(scheDeductions) == "object") 
		{
			for(i in scheDeductions) {(totalAmt = totalAmt + parseFloat(scheDeductions[i]["Amount ($)"]))};
		}
	
		logDebug("Total AMount Deductions" + totalAmt);
		var tAmt = totalAmt + ' ';
		editAppSpecific("Total Deductions",tAmt);	
	}

var schedC = loadASITable("SCHEDULE C - DAIRY INGREDIENTS");
if(schedC){
 var lbsOfProductMade=0;
 var lbsOfMilkUsed=0;
 var lbsOfButterFatMilkUsed=0;
 var lbsOfMilkCreamUsed=0;
 var lbsOfButterfatCreamUsed=0;
 var lbsOfSkimMilkUsed=0;
 var lbsOfButterfatSkimMilkUsed=0;
 var lbsOfOtherIngredientsUsed=0;
 var lbsOfButterfatOtherIngredientsUsed=0;
 
 if (typeof(schedC) == "object") {
 
 for(a in schedC) {(lbsOfProductMade = lbsOfProductMade + parseFloat(schedC[a]["Lbs Made"]))};
 for(b in schedC) {(lbsOfMilkUsed = lbsOfMilkUsed + parseFloat(schedC[b]["Lbs of Milk Used"]))};
 for(c in schedC) {(lbsOfButterFatMilkUsed = lbsOfButterFatMilkUsed + parseFloat(schedC[c]["Lbs of Butterfat Milk Used"]))};
 for(d in schedC) {(lbsOfMilkCreamUsed = lbsOfMilkCreamUsed + parseFloat(schedC[d]["Lbs of Milk Cream Used"]))};
 for(e in schedC) {(lbsOfButterfatCreamUsed =  lbsOfButterfatCreamUsed + parseFloat(schedC[e]["Lbs of Butterfat Cream Used"]))};
 for(f in schedC) {(lbsOfSkimMilkUsed =  lbsOfSkimMilkUsed + parseFloat(schedC[f]["Lbs of Skim Milk Used"]))};
 for(g in schedC) {(lbsOfButterfatSkimMilkUsed = lbsOfButterfatSkimMilkUsed + parseFloat(schedC[g]["Lbs of Butterfat Skim Milk Used"]))};
 for(h in schedC) {(lbsOfOtherIngredientsUsed = lbsOfOtherIngredientsUsed + parseFloat(schedC[h]["Lbs of Other Ingredients Used"]))};
 for(i in schedC) {(lbsOfButterfatOtherIngredientsUsed = lbsOfButterfatOtherIngredientsUsed + parseFloat(schedC[i]["Lbs of Butterfat Other Ingredients Used"]))};
 }

logDebug("Total Lbs of Product Made: " + lbsOfProductMade);
var tLbsOfProductMade =  lbsOfProductMade + ' ';

logDebug("Total Lbs of Milk Used: " + lbsOfMilkUsed);
var tLbsOfMilkUsed = lbsOfMilkUsed + ' ';

logDebug("Total Lbs of Butterfat Milk Used: " + lbsOfButterFatMilkUsed);
var tLbsOfButterFatMilkUsed = lbsOfButterFatMilkUsed+ ' ';

logDebug("Total Lbs of Milk Cream Used: " + lbsOfMilkCreamUsed);
var tLbsOfMilkCreamUsed = lbsOfMilkCreamUsed + ' ';

logDebug("Total Lbs of Butterfat Cream Used: " + lbsOfButterfatCreamUsed);
var tLbsOfButterfatCreamUsed= lbsOfButterfatCreamUsed + ' ';

logDebug("Total Lbs of Skim Mlik Used: " + lbsOfSkimMilkUsed);
var tLbsOfSkimMilkUsed= lbsOfSkimMilkUsed + ' ';

logDebug("Total Lbs of Butterfat Skim Mlik Used: " + lbsOfButterfatSkimMilkUsed);
var tLbsOfButterfatSkimMilkUsed= lbsOfButterfatSkimMilkUsed + ' ';

logDebug("Total Lbs of Other Ingredients Used: " + lbsOfOtherIngredientsUsed);
var tLbsOfOtherIngredientsUsed= lbsOfOtherIngredientsUsed + ' ';

logDebug("Total Lbs of Butterfat Other Ingredients Used: " + lbsOfButterfatOtherIngredientsUsed);
var tLbsOfButterfatOtherIngredientsUsed= lbsOfButterfatOtherIngredientsUsed + ' ';
 
editAppSpecific("Total Lbs of Product Made",tLbsOfProductMade);
editAppSpecific("Total Lbs of Milk Used",tLbsOfMilkUsed);
editAppSpecific("Total Lbs of Butterfat Milk Used",tLbsOfButterFatMilkUsed);
editAppSpecific("Total Lbs of Cream Used",tLbsOfMilkCreamUsed);
editAppSpecific("Total Lbs of Butterfat Cream Used",tLbsOfButterfatCreamUsed);
editAppSpecific("Total Lbs of Skim Milk Used",tLbsOfSkimMilkUsed);
editAppSpecific("Total Lbs of Butterfat Skim Milk Used", tLbsOfButterfatSkimMilkUsed);
editAppSpecific("Total Lbs of Other Ingredients Used",tLbsOfOtherIngredientsUsed);
editAppSpecific("Totals Lbs of Butterfat Other Ingredients Used",tLbsOfButterfatOtherIngredientsUsed);
}
	
var schedD = loadASITable("SCHEDULE D - FLUID MILK SALES");
if (schedD){

	var outOfStatePounds =0;
	var outOfStateButterfat =0;
	var poundsOfDairyProducts=0;
	var poundsOfButterfat=0;
	
	if (typeof(schedD) == "object") {
		
		for(i in schedD) {(outOfStatePounds = outOfStatePounds + parseFloat(schedD[i]["Out-of-State Pounds of Product"]))};
		for(j in schedD) {(outOfStateButterfat = outOfStateButterfat + parseFloat(schedD[j]["Out-of-State Pounds of Butterfat"]))};
		for(k in schedD) {(poundsOfDairyProducts = poundsOfDairyProducts + parseFloat(schedD[k]["NYS Pounds of Dairy Products"]))};
		for(l in schedD) {(poundsOfButterfat = poundsOfButterfat + parseFloat(schedD[l]["NYS Pounds of Butterfat"]))};
	}
	
	logDebug("Total Out of Sate Pounds of  Product: " + outOfStatePounds);
	var tOutOfStatePounds = outOfStatePounds + ' ' ;
	
	logDebug("Total Out of State Pounds of Butterfat: " + outOfStateButterfat);
	var tOutOfStateButterfat = outOfStateButterfat + ' ';
	
	logDebug("Total NYS Pounds of Dairy Products: " + poundsOfDairyProducts);
	var tPoundsOfDairyProducts = poundsOfDairyProducts + ' ';
	
	logDebug("Total NYS Pounds of Butterfat: " + poundsOfButterfat);
	var tPoundsOfButterfat = poundsOfButterfat + ' ';
	
	editAppSpecific("Out-of-State Pounds of Products",tOutOfStatePounds);	
	editAppSpecific("Out-of-State Pounds of Butterfat",tOutOfStateButterfat);
	editAppSpecific("NYS Pounds of Dairy Products",  tPoundsOfDairyProducts);
	editAppSpecific("NYS Pounds of Butterfat", tPoundsOfButterfat);	
	}
	}

}

if (wfTask =="Dairy Industry Review" && wfStatus =="Completed"){
	
	
	var workflowResult = aa.workflow.getTasks(capId);
	var wfObj;
	var wftrue = workflowResult.getSuccess();
	if (wftrue) {
	wfObj = workflowResult.getOutput();
	}
	else {
	logMessage("**ERROR: Failed to get workflow object: " + capId.getErrorMessage());
	}

	for (i in wfObj) {
	var fTask = wfObj[i];
	var desc = fTask.getTaskDescription();
	var disp = fTask.getDisposition();
	if (desc =="Application Intake" && disp =="Received Online"){
	closeTask("Statistical Unit Update","","Updated via script","");
	closeTask("Closure","Closed","Updated via script","");
	updateAppStatus("Approved","updated via script",capId);
	}

	}
}




