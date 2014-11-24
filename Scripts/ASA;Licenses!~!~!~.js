if (appMatch("Licenses/Plant/Soil or Plant Inoculant/Application") || appMatch("Licenses/Amendment/Add Product/NA")) {
	aa.runScriptInNewTransaction("ACA_HAZMATSCRIPT");
	}
if(!appMatch("Licenses/Amendment/*/*")){
updateAppStatus("Received","");
closeTask("Application Intake","Received","Updated via script","");
}
felonyConviction();

logdebug("Partial CAPID is" + partialCap);

setPrimaryContactForAGM(capId,"*","*");

if (appMatch("Licenses/Amendment/Add-Remove Location/Dealer")||appMatch("Licenses/Plant/Nursery Dealer/Renewal")) {
	addNewLocationfee();
	}
	
function setPrimaryContactForAGM(itemCap,appTypeType,appSubTypeType) {
	var primContactType = lookup("Lookup:PrimaryContactType",appTypeType + "/" + appSubTypeType);

	if (primContactType == undefined) {
		primContactType = "Business";
	} 

	var conObj = getContactObj(itemCap,primContactType);

	if (conObj) {
		conObj.primary = "Y";
		conObj.save();	
	}	
}