felonyConviction();
logdebug("CAPID is" + capId);

setPrimaryContactForAGM(capId,"Plant", "Nursery Dealer");



if(appMatch("Licenses/Plant/Soil or Plant Inoculant/Product")){
updateAppStatus("Received","");
closeTask("Application Intake","Received","Updated via script","");
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



