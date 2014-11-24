/* Comment out Non License Unit Condition Blocks
if (wfTask =="Plant Industry Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
*/
if (wfTask =="Application Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
	
logDebug("CapId" + capId);
logDebug("Custom ID for Products" + capId.getCustomID());

if (wfTask =="Plant Industry Review" && wfStatus == "Complete") {
		
	if (appMatch("Licenses/Plant/Soil or Plant Inoculant/Application")){
	productArray = getChildren("Licenses/Plant/Soil or Plant Inoculant/Product", capId);
	
	for(zz in productArray){
	var status = aa.cap.getCap(productArray[zz]).getOutput().getCapStatus();
	logDebug("Status" + status);
	if(status == "Approved"){
		continue;
				}
	else{
	showMessage = true;
	cancel = true;
	comment("There are unapproved products on the application. Please approve the products before issuing the license.");
			}
		}
	}
}