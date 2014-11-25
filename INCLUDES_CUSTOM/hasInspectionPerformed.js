function hasInspectionPerformed() {
    var wftsk = "Inspection";
    var wftskStatus = "Complete";
    var inspType = "Nursery Grower";
    var inspStatus = "Completed";
    var appType = "Establishment";
    var pEstCapId=null;

    //check to see if inspection wftask is active
    if (isTaskActive(wftsk)) {
        //aa.print("isTaskActive: Active");

        capTypeStr = aa.cap.getCap(capId).getOutput().getCapType().toString();
        capTypeArray = capTypeStr.split("/");

        //aa.print("capTypeArray:" + capTypeArray[3]);

        // get parent capid(Establishment)
        if (capTypeArray[3].equals("Application")) { //Renewal"
            pEstCapId = getEstParent(appType, capId);
        }else if(capTypeArray[3].equals("Renewal")) { 
            //get parent license
            var parentLic = getParentLicenseCapID(capId); // getMatchingParent(appGroup, appType, appSubtype, appCategory);
            //aa.print("Parent Lic" + parentLic.getCustomID()); //Test for Inspection Establishment
            pLicArray = String(parentLic).split("-");
            var parentLicenseCAPID = aa.cap.getCapID(pLicArray[0], pLicArray[1], pLicArray[2]).getOutput();
            //aa.print("parentLicenseCAPID:" + parentLicenseCAPID.getCustomID());

            pEstCapId = getEstParent(appType, parentLicenseCAPID);
            //aa.print("pEstCapId:" + pEstCapId);
        }

        if (pEstCapId != null) {
            //aa.print("pEstCapId:" + pEstCapId.getCustomID());

            //get the inspections for est parent cap
            var r = aa.inspection.getInspections(pEstCapId);  // have to use this method to get guidesheet data
            if (r.getSuccess()) {
                var inspArray = r.getOutput();

                //loop thru inspections
                for (i in inspArray) {
                    var inspModel = inspArray[i].getInspection();

                    //check to see if inspection is "Nursery Grower"
                    if (!String(inspType).equals(inspArray[i].getInspectionType())){
                        //aa.print("inspArray[i].getInspectionType():" + inspArray[i].getInspectionType());
                        continue;
                    }
                    
                    //check to see if status is "Completed"
                    if (!String(inspStatus).equals(inspArray[i].getInspectionStatus())) {
                        //aa.print("Insp Status: " + inspArray[i].getInspectionStatus());
                        continue;
                    }
                    //aa.print("inspArray[i].getInspectionType():" + inspArray[i].getInspectionType() + "--" + inspArray[i].getInspectionStatus());
                    
                    //get inspection
                    iObjResult = aa.inspection.getInspection(pEstCapId, inspArray[i].getIdNumber());
                    if (!iObjResult.getSuccess())
                    { 
                        //aa.print("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage()); 
                        return false; 
                    }else{
                        //get the inspection object
                        inspResultObj = iObjResult.getOutput();

                        // get inspection date
                        inspRealResultDate = dateFormatted(inspResultObj.getInspectionDate().getMonth(),
                        inspResultObj.getInspectionDate().getDayOfMonth(), inspResultObj.getInspectionDate().getYear(), "MM/DD/YYYY");

                        //aa.print("inspRealResultDate:" + inspRealResultDate);

                        //aa.print("dateDiff:" + getDateDiff(inspRealResultDate));
                        // if the inspection within 2 years update status and exit
                        if (parseInt(getDateDiff(inspRealResultDate)) < parseInt(730)) {
                            //updateTask(wftsk, wftskStatus, "", ""); //dont need this line
                            return true;
                        }
                                    
                    }
                }
            }
    
        }
    }
    return false;
}