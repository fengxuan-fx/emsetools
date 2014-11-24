/*------------------------------------------------------------------------------------------------------/
| Program : Convert Temp Record
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|   The following script code will attempt to read the assocaite event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/


/*aa.env.setValue("RECORD_ID","13EST-000095");
aa.env.setValue("ScriptTest","Y"); */

var recordID = aa.env.getValue("RECORD_ID");
recordID = recordID.trim();
var scriptTest = aa.env.getValue("ScriptTest");
aa.env.setValue("NEW_RECORD_ID","");
try {
    var getCapResult = aa.cap.getCapID(recordID.trim());
    if (getCapResult.getSuccess()) {
        var itemCap = getCapResult.getOutput();
        var cap = aa.cap.getCap(itemCap).getOutput();
        var partialCap = !cap.isCompleteCap();
        
        if (partialCap) {

            var capIDModel = aa.cap.getCapID(recordID).getOutput();
            var tempCapModel = aa.cap.getCapByPK(capIDModel,true).getOutput();
            var tempCapModel4Copy = aa.cap.getCapViewBySingle4ACA(capIDModel); 
            //Get the people from the temp record before converted
            var capPeoples = getPeople(itemCap);
            //Get the ASI from the temp record before converted.
            var AInfo = new Array();
            var useAppSpecificGroupName = false;
            loadAppSpecific(AInfo,itemCap);
            //Get the ASIT from the temp record before converted
            var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
            convertResult = aa.cap.createRegularCapModel4ACA(tempCapModel, null, false, false);
           
            if (convertResult.getSuccess()) {
                var capModel = convertResult.getOutput();

                aa.env.setValue("NEW_RECORD_ID",capModel.getCapID().getCustomID());
                aa.env.setValue("InterfaceReturnCode","0");
                aa.env.setValue("InterfaceReturnMessage","Successfully converted partial record to full record: " + capIDModel.toString() + " to " + capModel.getCapID().getCustomID());
                updateStatusResult = aa.cap.updateAppStatus(capModel.getCapID(), "APPLICATION", "Incomplete", aa.date.getCurrentDate(),"", aa.person.getUser("ADMIN").getOutput());

                //Copy any contacts
                for (var loopk in capPeoples)
                {
                    sourcePeopleModel = capPeoples[loopk];
                    sourcePeopleModel.getCapContactModel().setCapID(capModel.getCapID());
                    aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
                }

                if (tempCapModel4Copy.getAddressModel() != null)
                    var createAddressResult = aa.address.createAddressWithAPOAttribute(capModel.getCapID(),tempCapModel4Copy.getAddressModel());

                //Copy the ASI over
                copyAppSpecific(capModel.getCapID());
                //Copy the ASIT over
                if (gm)
                    copyASITables(gm,capModel.getCapID());

                //Copy education
                if (tempCapModel4Copy.getEducationList() != null)
                    aa.education.copyEducationList(capIDModel, capModel.getCapID());

                //Copy documents over
                
                var tempID = getParentLicenseCapID(capModel.getCapID());
                aa.cap.transferRenewCapDocument(tempID, capModel.getCapID(), true);


            } else {
                aa.env.setValue("InterfaceReturnCode","1");
                aa.env.setValue("InterfaceReturnMessage","There was an error converting the temporary record.");
            } 
        } else {
            aa.env.setValue("InterfaceReturnCode","1");
            aa.env.setValue("InterfaceReturnMessage","Record is not a temporary record");            
        }

    }  
    else
      { 
        aa.env.setValue("InterfaceReturnCode","1");
        aa.env.setValue("InterfaceReturnMessage","Could not find record");
      }

    if (scriptTest == "Y") printEnv(); 

} catch (err) {
    aa.env.setValue("InterfaceReturnCode","1");
    aa.env.setValue("InterfaceReturnMessage",err);
}

/*------------------------------------------------------------------------------------------------------/
| Functions
/------------------------------------------------------------------------------------------------------*/

function logDebug(estr) {
    aa.print(estr);
}

function printEnv() {
    //Log All Environmental Variables as  globals
    var params = aa.env.getParamValues();
    var keys =  params.keys();
    var key = null;
    while(keys.hasMoreElements())
    {
     key = keys.nextElement();
     eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
     aa.print(key + " = " + aa.env.getValue(key));
    }
}

function matches(eVal,argList) {
   for (var i=1; i<arguments.length;i++)
    if (arguments[i] == eVal)
        return true;
}

function getPeople(capId)
{
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if(s_result.getSuccess())
    {
        capPeopleArr = s_result.getOutput();
        if(capPeopleArr != null || capPeopleArr.length > 0)
        {
            for (loopk in capPeopleArr) 
            {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess())
                {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        }
        
        else
        {
            aa.print("WARNING: no People on this CAP:" + capId);
            capPeopleArr = null;
        }
    }
    else
    {
        aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;    
    }
    return capPeopleArr;
}

function convertContactAddressModelArr(contactAddressScriptModelArr)
{
    var contactAddressModelArr = null;
    if(contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0)
    {
        contactAddressModelArr = aa.util.newArrayList();
        for(loopk in contactAddressScriptModelArr)
        {
            contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
        }
    }   
    return contactAddressModelArr;
}

function loadAppSpecific(thisArr,itemCap) {
    // 
    // Returns an associative array of App Specific Info
    // Optional second parameter, cap ID to load from
    //

        var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess())
        {
        var fAppSpecInfoObj = appSpecInfoResult.getOutput();

        for (loopk in fAppSpecInfoObj)
            {
            if (useAppSpecificGroupName)
                thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
            else
                thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
            }
        }
    }

function copyAppSpecific(newCap) // copy all App Specific info into new Cap, 1 optional parameter for ignoreArr
{
    var ignoreArr = new Array();
    var limitCopy = false;
    if (arguments.length > 1) 
    {
        ignoreArr = arguments[1];
        limitCopy = true;
    }
    
    for (asi in AInfo){
        //Check list
        if(limitCopy){
            var ignore=false;
            for(var i = 0; i < ignoreArr.length; i++)
                if(ignoreArr[i] == asi){
                    ignore=true;
                    break;
                }
            if(ignore)
                continue;
        }
        editAppSpecific(asi,AInfo[asi],newCap);
    }
}

function editAppSpecific(itemName,itemValue)  // optional: itemCap
{

    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
    
    if (useAppSpecificGroupName)
    {
        
        itemGroup = itemName.substr(0,itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".")+1);
    }
    
    var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);

    if (appSpecInfoResult.getSuccess())
     {
        if(arguments.length < 3) //If no capId passed update the ASI Array
            AInfo[itemName] = itemValue; 
    }   

}

function copyASITables(sourceTables,pToCapId) {
    // Function dependencies on addASITable()
    // par3 is optional 0 based string array of table to ignore
    

    var gm = sourceTables;
    var ta = gm.getTablesArray()
    var tai = ta.iterator();
    var tableArr = new Array();
    var ignoreArr = new Array();
    var limitCopy = false;
    if (arguments.length > 2) 
    {
        ignoreArr = arguments[2];
        limitCopy = true;
    }

    while (tai.hasNext())
      {
      var tsm = tai.next();

      var tempObject = new Array();
      var tempArray = new Array();
      var tn = tsm.getTableName() + "";
      var numrows = 0;
      
      //Check list
      if(limitCopy){
        var ignore=false;
        for(var i = 0; i < ignoreArr.length; i++)
            if(ignoreArr[i] == tn){
                ignore=true;
                break;
            }
        if(ignore)
            continue;
      } 
      if (!tsm.rowIndex.isEmpty())
        {
          var tsmfldi = tsm.getTableField().iterator();
          var tsmcoli = tsm.getColumns().iterator();
          var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
          var numrows = 1;
          while (tsmfldi.hasNext())  // cycle through fields
            {
            if (!tsmcoli.hasNext())  // cycle through columns
                {
                var tsmcoli = tsm.getColumns().iterator();
                tempArray.push(tempObject);    // end of record
                var tempObject = new Array();  // clear the temp obj
                numrows++;
                }
            var tcol = tsmcoli.next();
            var tval = tsmfldi.next();
            
            var readOnly = 'N';
            if (readOnlyi.hasNext()) {
                readOnly = readOnlyi.next();
                }

            var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
            tempObject[tcol.getColumnName()] = fieldInfo;
            //tempObject[tcol.getColumnName()] = tval; 
            }

            tempArray.push(tempObject);  // end of record 
        }

        addASITable(tn,tempArray,pToCapId);
      }
    }

function addASITable(tableName,tableValueArray) // optional capId
        {
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object

    if (arguments.length > 2)
        itemCap = arguments[2]; // use cap ID specified in args
 
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName)
 
    if (!tssmResult.getSuccess())
        { logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()) ; return false }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
        var fld_readonly = tsm.getReadonlyField(); // get Readonly field
     
            for (thisrow in tableValueArray)
        {
  
        var col = tsm.getColumns()
        var coli = col.iterator();
  
        while (coli.hasNext())
            {
            var colname = coli.next();
  
            if (typeof(tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
                {
                fld.add(tableValueArray[thisrow][colname.getColumnName()].fieldValue);
                fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
                }
            else // we are passed a string
                {
                fld.add(tableValueArray[thisrow][colname.getColumnName()]);
                fld_readonly.add(null);
                }
            }
  
        tsm.setTableField(fld);
  
        tsm.setReadonlyField(fld_readonly);
  
        }
  
    var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, "ADMIN");
   
     if (!addResult .getSuccess())
        { logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()) ; return false }
    else
        logDebug("Successfully added record to ASI Table: " + tableName);
  
    }

function asiTableValObj(columnName, fieldValue, readOnly) {
    this.columnName = columnName;
    this.fieldValue = fieldValue;
    this.readOnly = readOnly;

    asiTableValObj.prototype.toString=function(){ return String(this.fieldValue) }
}

function getParentLicenseCapID(itemCap)
{
    if (itemCap == null || aa.util.instanceOfString(itemCap))
    {
        return null;
    }
    
    var licenseCap = null;
    
    var result2 = aa.cap.getProjectByChildCapID(itemCap, "Renewal", null);
    if(result2.getSuccess())
        {
            licenseProjects = result2.getOutput();
            if (licenseProjects != null && licenseProjects.length > 0)
            {
            licenseProject = licenseProjects[0];
            return licenseProject.getProjectID();
            }
        }

    var result = aa.cap.getProjectByChildCapID(itemCap, "EST", null);
        if(result.getSuccess())
    {
        projectScriptModels = result.getOutput();
        if (projectScriptModels != null && projectScriptModels.length > 0)
        {
        projectScriptModel = projectScriptModels[0];
        licenseCap = projectScriptModel.getProjectID();
        return licenseCap;
        }
    }
    

          return false;
          
    
}

function copyAddresses(pFromCapId, pToCapId)
    {
    //Copies all property addresses from pFromCapId to pToCapId
    //If pToCapId is null, copies to current CAP
    //07SSP-00037/SP5017
    //
    
    if (pToCapId==null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;


    //get addresses from originating CAP
    var capAddressResult = aa.address.getAddressWithAttributeByCapId(pFromCapId);
    var copied = 0;
    if (capAddressResult.getSuccess())
        {
        Address = capAddressResult.getOutput();
        for (yy in Address)
            {
            newAddress = Address[yy];
            newAddress.setCapID(vToCapId);
            if (priAddrExists)
                newAddress.setPrimaryFlag("N"); //prevent target CAP from having more than 1 primary address
            aa.address.createAddressWithAPOAttribute(vToCapId, newAddress);
            logDebug("Copied address from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
            copied++;
            }
        }
    else
        {
        logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
        return false;
        }
    return copied; 
    }