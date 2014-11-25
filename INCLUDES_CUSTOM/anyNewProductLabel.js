function anyNewProductLabel() {
    myCap = aa.cap.getCap(capId).getOutput();
    myAppTypeString = myCap.getCapType().toString();
    myAppTypeArray = myAppTypeString.split("/");

    //get table name
    tblName = getTableName4Cap(myAppTypeArray[2]);

    if (isEmpty(tblName) && isBlank(tblName)) return false;

    var parentLicID = getParentCapID4Renewal();
    aa.print("parentLicID:" + parentLicID.getCustomID()); //

    //load given table from parent
    var arrPrntASIT = loadASITable(tblName, parentLicID);

    //load given table from current cap
    var arrchldASIT = loadASITable(tblName, capId);

    //aa.print("arrPrntASIT.length:" + (typeof (arrPrntASIT) == "object") + " arrchldASIT.length:" + (typeof (arrchldASIT) == "object"));
    // check to see if both have product table 
    if (typeof (arrPrntASIT) == "object" && typeof (arrchldASIT) == "object") {
        
        // check to see if row count is equal
        if (arrPrntASIT.length == arrchldASIT.length) {
            isAllProductInfoSame(arrPrntASIT, arrchldASIT, parentLicID, tblName);
			return true;
        } else {
            aa.print("Row Count is not same");
            return false;
        }
    }

    //return false;
 }

 //returns the table name to compare for given type