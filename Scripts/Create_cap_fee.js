/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|abc
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|       available to all master scripts
|
| Notes   : 09/21/2012 - Seth Axthelm - Added document upload function, paramaters hash functions
|                                                              and sendNotification()
|           11/30/2012 - Seth Axthelm - Added renewal override scripts
|           11/30/2012 - Seth Axthelm - Added copyChildren function
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Document Upload Functions (Start)
/------------------------------------------------------------------------------------------------------*/
function editCapConditionStatus(pType, pDesc, pStatus, pStatusType) {
    // updates a condition with the pType and pDesc
    // to pStatus and pStatusType, returns true if updates, false if not
    // will not update if status is already pStatus && pStatusType
    // all parameters are required except for pType

    if (pType == null)
        var condResult = aa.capCondition.getCapConditions(capId);
    else
        var condResult = aa.capCondition.getCapConditions(capId, pType);

    if (condResult.getSuccess())
        var capConds = condResult.getOutput();
    else {
        logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        return false;
    }


    for (cc in capConds) {
        var thisCond = capConds[cc];
        var cStatus = thisCond.getConditionStatus();
        var cStatusType = thisCond.getConditionStatusType();
        var cDesc = thisCond.getConditionDescription();
        var cImpact = thisCond.getImpactCode();
        logDebug(cStatus + ": " + cStatusType);




        if (cDesc.toUpperCase() == pDesc.toUpperCase()) {
            if (!pStatus.toUpperCase().equals(cStatus.toUpperCase())) {
                thisCond.setConditionStatus(pStatus);
                thisCond.setConditionStatusType(pStatusType);
                thisCond.setImpactCode("");
                aa.capCondition.editCapCondition(thisCond);
                return true; // condition has been found and updated
            } else {
                logDebug("ERROR: condition found but already in the status of pStatus and pStatusType");
                return false; // condition found but already in the status of pStatus and pStatusType
            }
        }
    }

    logDebug("ERROR: no matching condition found");
    return false; //no matching condition found

}

function addParent(parentAppNum)
//
// adds the current application to the parent
//
{
    itemCap = capId;
    if (arguments.length == 2) {
        itemCap = arguments[1]; // subprocess

    }

    var getCapResult = aa.cap.getCapID(parentAppNum);
    if (getCapResult.getSuccess()) {
        var parentId = getCapResult.getOutput();
        var linkResult = aa.cap.createAppHierarchy(parentId, itemCap);
        if (linkResult.getSuccess())
            logDebug("Successfully linked to Parent Application : " + parentAppNum);
        else
            logDebug("**ERROR: linking to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
    }
    else
    { logDebug("**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()); }
}

function removeParent(parentAppNum)
//
// removes the current application from the parent
//
{
    itemCap = capId;
    if (arguments.length == 2) {
        itemCap = arguments[1]; // subprocess

    }

    var getCapResult = aa.cap.getCapID(parentAppNum);
    if (getCapResult.getSuccess()) {
        var parentId = getCapResult.getOutput();
        var linkResult = aa.cap.removeAppHierarchy(parentId, itemCap);
        if (linkResult.getSuccess())
            logDebug("Successfully removed link to Parent Application : " + parentAppNum);
        else
            logDebug("**WARNING: removing link to parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
    }
    else
    { logDebug("**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()); }
}


function getDocOperation(docModelList) {
    var docModel = docModelList.get(0);
    if (docModel == null) {
        return false;
    }

    if (docModel.getCategoryByAction() == null || "".equals(docModel.getCategoryByAction())) {
        return "UPLOAD";
    }
    //Judging it's check in
    else if ("CHECK-IN".equals(docModel.getCategoryByAction())) {
        return "CHECK_IN";
    }
    //Judging it's resubmit or normal upload.
    else if ("RESUBMIT".equals(docModel.getCategoryByAction())) {
        return "RESUBMIT";
    }
}

/*------------------------------------------------------------------------------------------------------/
|  Document Upload Functions (End)
/------------------------------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------------------------------/
|  Notification Template Functions (Start)
/------------------------------------------------------------------------------------------------------*/

function getRecordParams4Notification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$altID$$", capIDString);
    addParameter(params, "$$capName$$", capName);
    addParameter(params, "$$capStatus$$", capStatus);
    addParameter(params, "$$fileDate$$", fileDate);
    addParameter(params, "$$workDesc$$", workDescGet(capId));
    addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));

    return params;
}

function getACARecordParam4Notification(params, acaUrl) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));

    return params;
}

function getACADocDownloadParam4Notification(params, acaUrl, docModel) {
    // pass in a hashtable and it will add the additional parameters to the table

    addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl, docModel));

    return params;
}

function getContactParams4Notification(params, conType) {
    // pass in a hashtable and it will add the additional parameters to the table
    // pass in contact type to retrieve

    contactArray = getContactArray();

    for (ca in contactArray) {
        thisContact = contactArray[ca];

        if (thisContact["contactType"] == conType) {

            conType = conType.toLowerCase();

            addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
            addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
            addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
            addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);
            addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);
            addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);
            addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);
            addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);
            addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);
            addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);
            addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);
            addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);
            addParameter(params, "$$" + conType + "City$$", thisContact["city"]);
            addParameter(params, "$$" + conType + "State$$", thisContact["state"]);
            addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);
            addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);
            addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);
            addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);
            addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);
        }
    }

    return params;
}

function getPrimaryAddressLineParam4Notification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    var addressLine = "";

    adResult = aa.address.getPrimaryAddressByCapID(capId, "Y");

    if (adResult.getSuccess()) {
        ad = adResult.getOutput().getAddressModel();

        addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
    }

    return params;
}

function getPrimaryOwnerParams4Notification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    capOwnerResult = aa.owner.getOwnerByCapId(capId);

    if (capOwnerResult.getSuccess()) {
        owner = capOwnerResult.getOutput();

        for (o in owner) {
            thisOwner = owner[o];
            if (thisOwner.getPrimaryOwner() == "Y") {
                addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
                addParameter(params, "$$ownerPhone$$", thisOwner.getPhone);
                break;
            }
        }
    }
    return params;
}

function addAdHocTask(adHocProcess, adHocTask, adHocNote, adHocUser, capID) {
    //adHocProcess must be same as one defined in R1SERVER_CONSTANT
    //adHocTask must be same as Task Name defined in AdHoc Process
    //adHocNote can be variable
    //Optional 4 parameters = Assigned to User ID must match an AA user
    //Optional 5 parameters = CapID
    var thisCap = capId;
    var thisUser = currentUserID;
    if (arguments.length > 3)
        thisUser = arguments[3];
    if (arguments.length > 4)
        thisCap = arguments[4];
    var userObj = aa.person.getUser(thisUser);
    if (!userObj.getSuccess()) {
        logDebug("Could not find user to assign to");
        return false;
    }
    var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem();
    taskObj.setProcessCode(adHocProcess);
    taskObj.setTaskDescription(adHocTask);
    taskObj.setDispositionNote(adHocNote);
    taskObj.setProcessID(0);
    taskObj.setAssignmentDate(aa.util.now());
    taskObj.setDueDate(aa.util.now());
    taskObj.setAssignedUser(userObj.getOutput());
    wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
    wf.createAdHocTaskItem(taskObj);
    return true;
}

function getACADocumentDownloadUrl(acaUrl, documentModel) {

    //returns the ACA URL for supplied document model

    var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);
    if (acaUrlResult.getSuccess()) {
        acaDocUrl = acaUrlResult.getOutput();
        return acaDocUrl;
    }
    else {
        logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
        return false;
    }
}


function getACARecordURL(acaUrl) {

    var acaRecordUrl = "";
    var id1 = capId.ID1;
    var id2 = capId.ID2;
    var id3 = capId.ID3;

    acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";
    acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();
    acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
    acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

    return acaRecordUrl;
}



/*
* add parameter to a hashtable, for use with notifications.
*/
function addParameter(pamaremeters, key, value) {
    if (key != null) {
        if (value == null) {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}

/*
* Send notification
*/
function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args

    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;

    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess()) {
        logDebug("Sent email successfully!");
        return true;
    }
    else {
        logDebug("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}

function getURLToNewRecord(ACAURL, servProvCode, group, typetype, subtype, category) {

    var smb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicemanagement.ServiceManagementBusiness").getOutput();
    var sm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicemanagement.ServiceModel").getOutput();
    var ctm = aa.cap.getCapTypeModel().getOutput();

    ctm.setGroup(group);
    ctm.setType(typetype);
    ctm.setSubType(subtype);
    ctm.setCategory(category);
    sm.setCapType(ctm);
    sm.setServPorvCode(servProvCode);
    var svcs = smb.getServices(sm).toArray();

    // returning first service found 

    for (var i in svcs) {
        return ACAURL + "/AgencyRedirect.aspx?agency=" + servProvCode + "&name=" + escape(svcs[i].getServiceName());
    }
    // or nothing

    return false;
}

/*------------------------------------------------------------------------------------------------------/
|  Notification Template Functions (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Standard Licensing Functions Override - Contact Addresses (Start)
/------------------------------------------------------------------------------------------------------*/

function createRefLicProf(rlpId, rlpType, pContactType) {
    // 
    //Creates/updates a reference licensed prof from a Contact
    //06SSP-00074, modified for 06SSP-00238

    var addrTypeToCopy = null;
    if (arguments.length == 4) addrTypeToCopy = arguments[3]; // optional 4th parameter, address type of multi-address to use

    var updating = false;

    conArr = getPeople(capId);

    if (!conArr.length) {
        logDebug("**WARNING: No contact available");
        return false;
    }


    var newLic = getRefLicenseProf(rlpId);

    if (newLic) {
        updating = true;
        logDebug("Updating existing Ref Lic Prof : " + rlpId);
    }
    else
        var newLic = aa.licenseScript.createLicenseScriptModel();

    //get contact record
    if (pContactType == null)
        var cont = conArr[0]; //if no contact type specified, use first contact
    else {
        var contFound = false;
        for (yy in conArr) {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType())) {
                cont = conArr[yy];
                contFound = true;
                break;
            }
        }
        if (!contFound) {
            logDebug("**WARNING: No Contact found of type: " + pContactType);
            return false;
        }
    }

    peop = cont.getPeople();
    var addr = null;

    if (addrTypeToCopy) {
        var pmcal = peop.getContactAddressList();
        if (pmcal) {
            pmcal = pmcal.toArray();
            for (var thisPm in pmcal) {
                if (addrTypeToCopy.equals(pmcal[thisPm].getAddressType())) {
                    addr = pmcal[thisPm];
                }
            }
        }
    }

    if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address

    newLic.setContactFirstName(cont.getFirstName());
    //newLic.setContactMiddleName(cont.getMiddleName());  //method not available
    newLic.setContactLastName(cont.getLastName());
    newLic.setBusinessName(peop.getBusinessName());
    newLic.setAddress1(addr.getAddressLine1());
    newLic.setAddress2(addr.getAddressLine2());
    newLic.setAddress3(addr.getAddressLine3());
    newLic.setCity(addr.getCity());
    newLic.setState(addr.getState());
    newLic.setZip(addr.getZip());
    newLic.setPhone1(peop.getPhone1());
    newLic.setPhone2(peop.getPhone2());
    newLic.setEMailAddress(peop.getEmail());
    newLic.setFax(peop.getFax());

    newLic.setAgencyCode(aa.getServiceProviderCode());
    newLic.setAuditDate(sysDate);
    newLic.setAuditID(currentUserID);
    newLic.setAuditStatus("A");

    if (AInfo["Insurance Co"]) newLic.setInsuranceCo(AInfo["Insurance Co"]);
    if (AInfo["Insurance Amount"]) newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
    if (AInfo["Insurance Exp Date"]) newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
    if (AInfo["Policy #"]) newLic.setPolicy(AInfo["Policy #"]);

    if (AInfo["Business License #"]) newLic.setBusinessLicense(AInfo["Business License #"]);
    if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

    newLic.setLicenseType(rlpType);
    newLic.setLicState("NY");
    newLic.setStateLicense(rlpId);

    if (updating)
        myResult = aa.licenseScript.editRefLicenseProf(newLic);
    else
        myResult = aa.licenseScript.createRefLicenseProf(newLic);

    if (myResult.getSuccess()) {
        logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
        return true;
    }
    else {
        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        return false;
    }
}

function createParent(grp, typ, stype, cat, desc)
//
// creates the new application and returns the capID object
// updated by JHS 10/23/12 to use copyContacts that handles addresses
//
{
    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess()) {
        var newId = appCreateResult.getOutput();
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput(); //Cap object
        var result = aa.cap.createAppHierarchy(newId, capId);
        if (result.getSuccess())
            logDebug("Parent application successfully linked");
        else
            logDebug("Could not link applications");

        // Copy Parcels

        var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
        if (capParcelResult.getSuccess()) {
            var Parcels = capParcelResult.getOutput().toArray();
            for (zz in Parcels) {
                logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                newCapParcel.setParcelModel(Parcels[zz]);
                newCapParcel.setCapIDModel(newId);
                newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                aa.parcel.createCapParcel(newCapParcel);
            }
        }

        // Copy Contacts

        copyContacts(capId, newId);

        // Copy Addresses
        capAddressResult = aa.address.getAddressByCapId(capId);
        if (capAddressResult.getSuccess()) {
            Address = capAddressResult.getOutput();
            for (yy in Address) {
                newAddress = Address[yy];
                newAddress.setCapID(newId);
                aa.address.createAddress(newAddress);
                logDebug("added address");
            }
        }

        return newId;
    }
    else {
        logDebug("**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
    }
}



function copyContacts(srcCapId, targetCapId) {
    //1. Get people with source CAPID.
    var capPeoples = getPeople(srcCapId);
    if (capPeoples == null || capPeoples.length == 0) {
        return;
    }
    //2. Get people with target CAPID.
    var targetPeople = getPeople(targetCapId);
    //3. Check to see which people is matched in both source and target.
    for (loopk in capPeoples) {
        sourcePeopleModel = capPeoples[loopk];
        //3.1 Set target CAPID to source people.
        sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
        targetPeopleModel = null;
        //3.2 Check to see if sourcePeople exist.
        if (targetPeople != null && targetPeople.length > 0) {
            for (loop2 in targetPeople) {
                if (isMatchPeople(sourcePeopleModel, targetPeople[loop2])) {
                    targetPeopleModel = targetPeople[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched people model.
        if (targetPeopleModel != null) {
            //3.3.1 Copy information from source to target.
            aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());

            //3.3.2 Copy contact address from source to target.
            if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople()) {
                targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
            }

            //3.3.3 Edit People with source People information. 
            aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
        }
        //3.4 It is new People model.
        else {
            //3.4.1 Create new people.
            aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
        }
    }
}

function editContactType(existingType, newType)
//Function will change contact types from exsistingType to newType, 
//optional paramter capID
{
    var updateCap = capId;
    if (arguments.length == 3)
        updateCap = arguments[2];

    capContactResult = aa.people.getCapContactByCapID(updateCap);
    if (capContactResult.getSuccess()) {
        Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var theContact = Contacts[yy].getCapContactModel();
            if (theContact.getContactType() == existingType) {
                theContact.setContactType(newType);
                var peopleModel = theContact.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(theContact);
                if (contactAddressrs.getSuccess()) {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
                aa.people.editCapContactWithAttribute(theContact);
                //logDebug("Contact for " + theContact.getFullName() + " Updated to " + newType);
            }
        }
    }
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2) {
    if (capContactScriptModel == null || capContactScriptModel2 == null) {
        return false;
    }
    var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
    var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
    var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
    var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
    var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
    var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
    var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
    var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
    if ((contactType1 == null && contactType2 != null)
        || (contactType1 != null && contactType2 == null)) {
        return false;
    }
    if (contactType1 != null && !contactType1.equals(contactType2)) {
        return false;
    }
    if ((firstName1 == null && firstName2 != null)
        || (firstName1 != null && firstName2 == null)) {
        return false;
    }
    if (firstName1 != null && !firstName1.equals(firstName2)) {
        return false;
    }
    if ((lastName1 == null && lastName2 != null)
        || (lastName1 != null && lastName2 == null)) {
        return false;
    }
    if (lastName1 != null && !lastName1.equals(lastName2)) {
        return false;
    }
    if ((fullName1 == null && fullName2 != null)
        || (fullName1 != null && fullName2 == null)) {
        return false;
    }
    if (fullName1 != null && !fullName1.equals(fullName2)) {
        return false;
    }
    return true;
}

function getPeople(capId) {
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if (s_result.getSuccess()) {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr != null || capPeopleArr.length > 0) {
            for (loopk in capPeopleArr) {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess()) {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        }

        else {
            aa.print("WARNING: no People on this CAP:" + capId);
            capPeopleArr = null;
        }
    }
    else {
        aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;
    }
    return capPeopleArr;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) {
    var contactAddressModelArr = null;
    if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) {
        contactAddressModelArr = aa.util.newArrayList();
        for (loopk in contactAddressScriptModelArr) {
            contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
        }
    }
    return contactAddressModelArr;
}

/*------------------------------------------------------------------------------------------------------/
|  Standard Licensing Functions Override - Contact Addresses (End)
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
|  License Issuance Functions and Renewal Function Overrides (Start)
/------------------------------------------------------------------------------------------------------*/


function createLicense(initStatus,copyASI) {
	//initStatus - record status to set the license to initially
	//copyASI - copy ASI from Application to License? (true/false)

	var newLic = null;
	var newLicId = null;
	var newLicIdString = null;
	var newLicenseType = appTypeArray[2];
        var copyASI = true;

	//create the license record
	newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "License",null);

	//field repurposed to represent the current term effective date
	editScheduledDate(sysDateMMDDYYYY,newLicId);
	//field repurposed to represent the original effective date
	editFirstIssuedDate(sysDateMMDDYYYY,newLicId);

	newLicIdString = newLicId.getCustomID();
	updateAppStatus(initStatus,"",newLicId);

	//copy all ASI
	if(copyASI) {
		copyAppSpecific(newLicId);
                copyASITables(capId, newLicId);
	}

	return newLicId;	
}

function createRefLP4Lookup(newLicIdString, newLicenseType, conType, conAddrType) {
    //All parameters are required
    //newLicIdString - license altID
    //newLicenseType - Ref LP license type
    //conType - Contact type to use for the reference LP
    //conAddrType - Contact address type to use for the reference LP

    createRefLicProf(newLicIdString, newLicenseType, conType, conAddrType);

    newLic = getRefLicenseProf(newLicIdString);
    if (newLic) {
        //manually set any values on the reference LP
        newLic.setAuditStatus("A");
        aa.licenseScript.editRefLicenseProf(newLic);
        logDebug("Reference LP successfully created");
    } else {
        logDebug("Reference LP not created");
    }
}

/* No longer used
function issueLicense(initStatus,copyASI,createRefLP,licHolderSwitch) {
//initStatus - record status to set the license to initially
//copyASI - copy ASI from Application to License? (true/false)
//createRefLP - create the reference LP (true/false)
//licHolderSwitch - switch the applicant to license holder

var newLic = null;
var newLicId = null;
var newLicIdString = null;
var newLicenseType = appTypeArray[2];

//create the license record
newLicId = createParent(appTypeArray[0], appTypeArray[1], appTypeArray[2], "License",null);

//field repurposed to represent the current term effective date
editScheduledDate(sysDateMMDDYYYY,newLicId);
//field repurposed to represent the original effective date
editFirstIssuedDate(sysDateMMDDYYYY,newLicId);

newLicIdString = newLicId.getCustomID();
updateAppStatus(initStatus,"",newLicId);

//copy all ASI
if(copyASI) {
copyAppSpecific(newLicId);
}

//Create the Reference LP if required
if(createRefLP && newLicIdString) {
createRefLicProf(newLicIdString,newLicenseType,"Applicant","Mailing");
newLic = getRefLicenseProf(newLicIdString);
if (newLic) {
//manually set any values on the reference LP
newLic.setAuditStatus("A");
aa.licenseScript.editRefLicenseProf(newLic);
logDebug("Reference LP successfully created");
} else {
logDebug("Reference LP not created");
}
}

//Switch the contact type of the applicant to license holder on the license
if(licHolderSwitch) {
conToChange = null; 
cons = aa.people.getCapContactByCapID(newLicId).getOutput(); 
for (thisCon in cons) {
if (cons[thisCon].getCapContactModel().getPeople().getContactType() == "Applicant") {
conToChange = cons[thisCon].getCapContactModel();
p = conToChange.getPeople(); 
p.setContactType("License Holder"); 
conToChange.setPeople(p); 
aa.people.editCapContact(conToChange);
logDebug("Contact type successfully switched to License Holder");
}
}
}

return newLicId;
} */

function setLicExpirationDate(itemCap) {
    //itemCap - license capId
    //the following are optional parameters
    //calcDateFrom - MM/DD/YYYY - the from date to use in the date calculation
    //dateOverride - MM/DD/YYYY - override the calculation, this date will be used
    //renewalStatus - if other than active override the status  


    var licNum = itemCap.getCustomID();

    if (arguments.length == 1) {
        calcDateFrom = null;
        dateOverride = null;
        renewalStatus = null;
    }

    if (arguments.length == 2) {
        calcDateFrom = arguments[1];
        dateOverride = null;
        renewalStatus = null;
    }

    if (arguments.length == 3) {
        calcDateFrom = arguments[1];
        dateOverride = arguments[2];
        renewalStatus = null;
    }

    if (arguments.length == 4) {
        calcDateFrom = arguments[1];
        dateOverride = arguments[2];
        renewalStatus = arguments[3];
    }

    var tmpNewDate = "";

    b1ExpResult = aa.expiration.getLicensesByCapID(itemCap);

    if (b1ExpResult.getSuccess()) {

        this.b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expUnit = this.b1Exp.getExpUnit();
        var expInterval = this.b1Exp.getExpInterval();

        if (expUnit == null) {
            logDebug("Could not set the expiration date, no expiration unit defined for expiration code: " + this.b1Exp.getExpCode());
            return false;
        }

        if (expUnit == "Days") {
            tmpNewDate = dateAdd(calcDateFrom, expInterval);
        }

        if (expUnit == "Months") {
            tmpNewDate = dateAddMonths(calcDateFrom, expInterval);
        }

        if (expUnit == "Years") {
            tmpNewDate = dateAddMonths(calcDateFrom, expInterval * 12);
        }
    }

    thisLic = new licenseObject(licNum, itemCap);

    if (dateOverride == null) {
        thisLic.setExpiration(dateAdd(tmpNewDate, 0));
    } else {
        thisLic.setExpiration(dateAdd(dateOverride, 0));
    }

    if (renewalStatus != null) {
        thisLic.setStatus(renewalStatus);
    } else {
        thisLic.setStatus("Active");
    }

    logDebug("Successfully set the expiration date and status");

    return true;

}

/* No longer used
function renewLicense() {
    
//2. Get parent license CAPID

parentLic = getParentLicenseCapID(capId); 
pLicArray = String(parentLic).split("-"); 
var parentLicenseCAPID = aa.cap.getCapID(pLicArray[0],pLicArray[1],pLicArray[2]).getOutput();

//field repurposed to represent the current term effective date
editScheduledDate(sysDateMMDDYYYY,parentLicenseCAPID);

logDebug("parent capid :" + parentLicenseCAPID);
var partialCapID = getPartialCapID(capId);

var result = aa.cap.updateRenewalCapStatus(parentLicenseCAPID, capId);

if (parentLicenseCAPID != null)
{

//3.1 Get projectScriptModel of renewal CAP.    
renewalCapProject = getRenewalCapByParentCapIDForReview(parentLicenseCAPID);
if (renewalCapProject != null)
{
//4. Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow that it is searched by ACA user.
aa.cap.updateAccessByACA(capId, "N");           
//5. Set parent license to "Active"
if (activeLicense(parentLicenseCAPID))
{
//6. Set renewal CAP status to "Complete"
renewalCapProject.setStatus("Complete");
aa.print("license(" + parentLicenseCAPID + ") is activated.");
aa.cap.updateProject(renewalCapProject);

//8. move renew document to parent cap
aa.cap.transferRenewCapDocument(partialCapID, parentLicenseCAPID, false);
aa.print("Transfer document for renew cap. Source Cap: " + partialCapID + ", target Cap: " + parentLicenseCAPID);
                
//9. Send approved license email to public user
aa.expiration.sendApprovedNoticEmailToCitizenUser(parentLicenseCAPID);
aa.print("send approved license email to citizen user.");
}
}
}
}*/

function getParentCapID4Renewal() {
    parentLic = getParentLicenseCapID(capId);
    pLicArray = String(parentLic).split("-");
    var parentLicenseCAPID = aa.cap.getCapID(pLicArray[0], pLicArray[1], pLicArray[2]).getOutput();

    return parentLicenseCAPID;
}

function completeRenewal(pLicCapId) {

    var parentLicenseCAPID = pLicCapId;

    //field repurposed to represent the current term effective date
    editScheduledDate(sysDateMMDDYYYY, parentLicenseCAPID);

    logDebug("parent capid :" + parentLicenseCAPID);
    var partialCapID = getPartialCapID(capId);

    var result = aa.cap.updateRenewalCapStatus(parentLicenseCAPID, capId);

    if (parentLicenseCAPID != null) {

        //3.1 Get projectScriptModel of renewal CAP.    
        renewalCapProject = getRenewalCapByParentCapIDForReview(parentLicenseCAPID);
        if (renewalCapProject != null) {
            //4. Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow that it is searched by ACA user.
            aa.cap.updateAccessByACA(capId, "N");
            //5. Set parent license to "Active"
			if (activeLicense(parentLicenseCAPID))
				{
				//6. Set renewal CAP status to "Complete"
				renewalCapProject.setStatus("Complete");
				logDebug("license(" + parentLicenseCAPID + ") is activated.");
				aa.cap.updateProject(renewalCapProject);

				//8. move renew document to parent cap
				aa.cap.transferRenewCapDocument(partialCapID, parentLicenseCAPID, false);
				logDebug("Transfer document for renew cap. Source Cap: " + partialCapID + ", target Cap: " + parentLicenseCAPID);

				//9. Send approved license email to public user
				//aa.expiration.sendApprovedNoticEmailToCitizenUser(parentLicenseCAPID);
				//aa.print("send approved license email to citizen user.");
				}
        }
    }
}

function getPartialCapID(capid) {
    if (capid == null || aa.util.instanceOfString(capid)) {
        return null;
    }
    //1. Get original partial CAPID  from related CAP table.
    var result = aa.cap.getProjectByChildCapID(capid, "EST", null);
    if (result.getSuccess()) {
        projectScriptModels = result.getOutput();
        if (projectScriptModels == null || projectScriptModels.length == 0) {
            aa.print("ERROR: Failed to get partial CAP with CAPID(" + capid + ")");
            return null;
        }
        //2. Get original partial CAP ID from project Model
        projectScriptModel = projectScriptModels[0];
        return projectScriptModel.getProjectID();
    }
    else {
        aa.print("ERROR: Failed to get partial CAP by child CAP(" + capid + "): " + result.getErrorMessage());
        return null;
    }
}

function getRenewalCapByParentCapIDForReview(parentCapid) {
    if (parentCapid == null || aa.util.instanceOfString(parentCapid)) {
        return null;
    }
    //1. Get parent license for review
    var result = aa.cap.getProjectByMasterID(parentCapid, "Renewal", "Review");
    if (result.getSuccess()) {
        projectScriptModels = result.getOutput();
        if (projectScriptModels == null || projectScriptModels.length == 0) {
            aa.print("ERROR: Failed to get renewal CAP by parent CAPID(" + parentCapid + ") for review");
            return null;
        }
        //2. return parent CAPID.
        projectScriptModel = projectScriptModels[0];
        return projectScriptModel;
    }
    else {
        aa.print("ERROR: Failed to get renewal CAP by parent CAP(" + parentCapid + ") for review: " + result.getErrorMessage());
        return null;
    }
}


function deactivateActiveTasks(processName) {

    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    for (i in wfObj) {
        fTask = wfObj[i];
        if (fTask.getProcessCode().equals(processName) || processName == null)
            if (fTask.getActiveFlag().equals("Y"))
                deactivateTask(fTask.getTaskDescription());
    }

}

function activeTasksCheck() {

    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess())
        wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    for (i in wfObj) {
        fTask = wfObj[i];
        if (fTask.getActiveFlag().equals("Y"))
            return true;
    }

    return false;
}

function activeLicense(capid) {
    if (capid == null || aa.util.instanceOfString(capid)) {
        return false;
    }
    //1. Set status to "Active", and update expired date.
    var result = aa.expiration.activeLicensesByCapID(capid);
    if (result.getSuccess()) {
        return true;
    }
    else {
        aa.print("ERROR: Failed to activate License with CAP(" + capid + "): " + result.getErrorMessage());
    }
    return false;
}

function editFirstIssuedDate(issuedDate) { // option CapId
    var itemCap = capId;

    if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

    var cdScriptObjResult = aa.cap.getCapDetail(itemCap);

    if (!cdScriptObjResult.getSuccess()) {
        logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()); return false;
    }

    var cdScriptObj = cdScriptObjResult.getOutput();

    if (!cdScriptObj) {
        logDebug("**ERROR: No cap detail script object"); return false;
    }

    cd = cdScriptObj.getCapDetailModel();

    var javascriptDate = new Date(issuedDate);

    var vIssuedDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());

    cd.setFirstIssuedDate(vIssuedDate);

    cdWrite = aa.cap.editCapDetail(cd);

    if (cdWrite.getSuccess()) {
        logDebug("updated first issued date to " + vIssuedDate); return true;
    }
    else {
        logDebug("**ERROR updating first issued date: " + cdWrite.getErrorMessage()); return false;
    }

}

/*------------------------------------------------------------------------------------------------------/
|  License Issuance Functions and Renewal Function Overrides  (End)
/------------------------------------------------------------------------------------------------------*/

function copyChildren(appType, appStatus, pId) {

    var childrenArray = new Array();

    childrenArray = getChildren(appType);

    if (childrenArray.length > 0) {

        for (xx in childrenArray) {
            thisChild = childrenArray[xx];

            var thisCap = aa.cap.getCap(thisChild).getOutput();
            var thisCapStatus = thisCap.getCapStatus();

            if (thisCapStatus == appStatus) {
                var linkResult = aa.cap.createAppHierarchy(pId, thisChild);
                if (linkResult.getSuccess())
                    logDebug("Successfully linked to License : " + thisChild.getCustomID());
                else
                    logDebug("ERROR: linking to lincese (" + thisChild.getCustomID() + "): " + linkResult.getErrorMessage());
            }
        }

        logDebug("Successfully linked the children to the parent");
        return true;
    } else {
        logDebug("No children found");
        return false;
    }
}

/*------------------------------------------------------------------------------------------------------/
|  Generate License Number (Start)
/------------------------------------------------------------------------------------------------------*/
//Generate license number (AHR)
function generateLicenseNumber() {

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {

            var con = Contacts[yy];
            if (con.getCapContactModel().getPeople().getContactType() == "Additional Location") {
                var arrAtt = Contacts[yy].getPeople().getAttributes().toArray();
                // logDebug("arrAtt.leng:" + arrAtt.length + " capId:" + capId.getCustomID());

                for (xx in arrAtt) {
                    if (arrAtt[xx].getAttributeName() == "LICENSE #" && arrAtt[xx].getAttributeValue() == null) {
                        peop = con.getPeople();

                        //get contact attributes 
                        var attrs = peop.getAttributes();

                        if (attrs) {
                            var ai = attrs.iterator();
                            while (ai.hasNext()) {
                                var xx = ai.next(); // xx is a CapContactAttributeModel
                                //logDebug("xx=" + xx.getAttributeName() + "-- Value=" + xx.getAttributeValue());
                                // update license number
                                if (xx.getAttributeName().toUpperCase() == "LICENSE #") {
                                    xx.setAttributeValue(capId.getCustomID() + "." + getNextLicenseNumber());
                                }
                            }
                            //set attributes
                            peop.setAttributes(attrs);
                            //con.setPeople();
                            con.getCapContactModel().setPeople(peop);
                            editResult = aa.people.editCapContactWithAttribute(con.getCapContactModel());
                            if (editResult.getSuccess()) {
                                logDebug("Edited the contact successfully");
                            } else {
                                logDebug("Error updating CAP contact " + editResult.getErrorMessage());
                            }

                        }
                    }
                }
            }
        }
    }

}

function getNextLicenseNumber() {

    var maxSFX = 0;

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {

            var con = Contacts[yy];
            if (con.getCapContactModel().getPeople().getContactType() == "Additional Location") {
                var arrAtt = Contacts[yy].getPeople().getAttributes().toArray();
                //logDebug("arrAtt.leng:" + arrAtt.length);

                for (xx in arrAtt) {
                    if (arrAtt[xx].getAttributeName() == "LICENSE #" && arrAtt[xx].getAttributeValue() != null) {
                        //logDebug("AttributeName: " + arrAtt[xx].getAttributeName() + " : " + arrAtt[xx].getAttributeValue());
                        var licenseNum = arrAtt[xx].getAttributeValue();

                        if (licenseNum.indexOf(".") > 0) {
                            var strVal = licenseNum.substr(licenseNum.indexOf(".") + 1);
                            //logDebug("strVal: " + strVal);
                            if (parseInt(strVal) > parseInt(maxSFX)) {
                                maxSFX = strVal;
                            }
                        }
                    }
                }
            }
        }
    }
    //increment it by one 
    maxSFX++;
    logDebug("maxSFX: " + maxSFX);

    return maxSFX;
}

/*------------------------------------------------------------------------------------------------------/
|  Generate License Number (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Copy Contacts/Adresses(Start)(AHR)
/------------------------------------------------------------------------------------------------------*/
function deleteCopyContacts(pFromCapId, pToCapId) {
    //Copies all contacts from pFromCapId to pToCapId
    //
    // like original but delete all existing contacts before copy
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;
    //FA 12-20-2010 Dont remove any contacts


    var sourceObj = getContactObjs(pFromCapId);
    logDebug("Source Objects" + sourceObj);
    for(yy in sourceObj){
    sourceObj[yy].replace(pToCapId);
    }
}


function deleteCopyAddresses(pFromCapId, pToCapId) {
    //Copies all property addresses from pFromCapId to pToCapId
    //If pToCapId is null, copies to current CAP
    //

    // modified original function to delete all of the addresses
    // on the target CAP first
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;

    //check if target CAP has primary address
    var capAddressResult = aa.address.getAddressByCapId(vToCapId);
    if (capAddressResult.getSuccess()) {
        Address = capAddressResult.getOutput();
        for (yy in Address) {
            addrOnTarget = Address[yy];
            delResult = aa.address.removeAddress(vToCapId, addrOnTarget.getAddressId());
            if (!delResult.getSuccess()) {
                logDebug("Error removing address on target CAP " + delResult.getErrorMessage());
            }
        }
    }
    else {
        logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
        return false;
    }

    //logDebug("pFromCapId=" + pFromCapId + "pToCapId=" + pToCapId);

    //get addresses from originating CAP
    var capAddressResult = aa.address.getAddressWithAttributeByCapId(pFromCapId);
    var copied = 0;
    if (capAddressResult.getSuccess()) {
        Address = capAddressResult.getOutput();
        for (yy in Address) {
            newAddress = Address[yy];
            newAddress.setCapID(vToCapId);
            aa.address.createAddressWithAPOAttribute(vToCapId, newAddress);
            logDebug("Copied address from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
            copied++;
        }
    }
    else {
        logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
        return false;
    }
    return copied;
}

function getParent() {
    // returns the capId object of the parent.  Assumes only one parent!
    //
    //logDebug( "capId==" + capId);

    getCapResult = aa.cap.getProjectParents(capId, 1);
    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else {
            logDebug("**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else {
        logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}

/*------------------------------------------------------------------------------------------------------/
|  Copy Contacts/Adresses (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Copy ASIT (Start)
/------------------------------------------------------------------------------------------------------*/
//copy ASIT Tables (AHR)
function CopyDeleteASIT(pFromCapID, pToCapId) {

    //
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    //
    // Optional parameter, cap ID to load from
    //

    var itemCap = pFromCapID;
    //if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;
        logDebug("Table Name+" + tn);
        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn; // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
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
        }

        var copyStr = "" + tn + " = tempArray";
message+=tn;
        if (numrows > 0) {

            // if (tn.indexOf("AMENDED SIGNING AUTHORITY INFO") != -1) {
            message+="ASI Table Array : " + tn + "--" + numrows + " Rows";
            logDebug(tblName + "----" + pToCapId);
            removeASITable(tblName, pToCapId);
            addASITable(tblName, tempArray, pToCapId);
            //}
        }
        eval(copyStr);  // move to table name
    }

}




function asiTableValObj(columnName, fieldValue, readOnly) {
    this.columnName = columnName;
    this.fieldValue = fieldValue;
    this.readOnly = readOnly;

    asiTableValObj.prototype.toString = function () { return this.fieldValue; }
}

function removeASITable(tableName, NewCapID) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValues is an associative array of values.  All elements MUST be strings.
    var itemCap = NewCapID;
    //if (arguments.length > 1)
    //  itemCap = arguments[1]; // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName, itemCap, currentUserID);

    if (!tssmResult.getSuccess())
    { aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()); return false; }
    else
        logDebug("Successfully removed all rows from ASI Table: " + tableName);
}
function CopyASITablesFromParent(pFromCapID, pToCapId) {

    //
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    //
    // Optional parameter, cap ID to load from
    //

    var itemCap = pFromCapID;
    //if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray();
    var tai = ta.iterator();

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;
        aa.print("Table Name+" + tn);
        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn; // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
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
        }

        var copyStr = "" + tn + " = tempArray";
        if (numrows > 0) {

            // if (tn.indexOf("AMENDED SIGNING AUTHORITY INFO") != -1) {
            aa.print("ASI Table Array : " + tn + " (" + numrows + " Rows)");
            aa.print(tblName + "----" + pToCapId);
            removeASITable(tblName, pToCapId);
            addASITable(tblName, tempArray, pToCapId);
            //}
        }
        eval(copyStr);  // move to table name
    }

}
/*------------------------------------------------------------------------------------------------------/
|  Copy ASIT (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Copy ASI (Start)
/------------------------------------------------------------------------------------------------------*/
//Copy App specific (AHR)
function copyApplSpecific(pFromCapID, pToCapId) // copy all App Specific info into new Cap
{
    var AInfo = new Array();
    loadApplSpecific(AInfo, pFromCapID);

    for (asi in AInfo) {
        editApplSpecific(asi, AInfo[asi], pToCapId, AInfo);
    }
}

function editApplSpecific(itemName, itemValue, itemCap, AInfo)  // optional: itemCap
{
    var updated = false;
    var useAppSpecificGroupName = false;
    var i = 0;

    //itemCap = capId;

    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0)
        { aa.print("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false; }

        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();
        if (itemName != "") {
            while (i < appspecObj.length && !updated) {
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
                    appspecObj[i].setChecklistComment(itemValue);

                    var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
                    if (actionResult.getSuccess()) {
                        aa.print("app spec info item " + itemName + " has been given a value of " + itemValue);
                    }
                    else {
                        aa.print("**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " + actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
                    }

                    updated = true;
                    AInfo[itemName] = itemValue;  // Update array used by this script
                }

                i++;

            } // while loop
        } // item name blank
    } // got app specific object    
    else {
        aa.print("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
    }
} //End Function

function loadApplSpecific(thisArr, itemCap) {
    // 
    // Returns an associative array of App Specific Info
    // Optional second parameter, cap ID to load from
    //

    var useAppSpecificGroupName = false;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var fAppSpecInfoObj = appSpecInfoResult.getOutput();

        for (loopk in fAppSpecInfoObj) {
            if (useAppSpecificGroupName)
                thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
            else
                thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
        }
    }
} /*------------------------------------------------------------------------------------------------------/
|  Copy ASI (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genAIRLetter() {
    var wFlowTask = "Application Review";                           // wflowTask
    var wfStatus = "Additional Info Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "ADDITIONAL INFORMATION REQUIRED";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    if (thisArr["Missing Fee"] == "CHECKED") {
        tsiVal += "Missing Fee, \n";
    }
    if (thisArr["Underpayment"] == "CHECKED") {
        tsiVal += "Underpayment, \n";
    }
    if (thisArr["Additional Information Needed"] == "CHECKED") {
        tsiVal += "Additional Information Needed, \n";
    }
    tsiVal += "Comments: " + thisArr["Comments"];
    aa.print("tsiVal:" + tsiVal);

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    return params;
}

function getwfTaskStatus(wfstr) {
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //aa.print("fTask Status:" + fTask.getDisposition());

        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
            aa.print("fTask Status:" + fTask.getDisposition());
            return fTask.getDisposition();
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Letter (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Milk Industry Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genAIRMLetter() {
    var wFlowTask = "Milk Industry Review";                           // wflowTask
    var wfStatus = "Additional Info Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "ADDITIONAL INFORMATION REQUIRED";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    if (thisArr["Missing Fee"] == "CHECKED") {
        tsiVal += "Missing Fee, \n";
    }
    if (thisArr["Underpayment"] == "CHECKED") {
        tsiVal += "Underpayment, \n";
    }
    if (thisArr["Additional Information Needed"] == "CHECKED") {
        tsiVal += "Additional Information Needed, \n";
    }
    tsiVal += "Comments: " + thisArr["Comments"];
    aa.print("tsiVal:" + tsiVal);

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    return params;
}

function getwfTaskStatus(wfstr) {
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //aa.print("fTask Status:" + fTask.getDisposition());

        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
            aa.print("fTask Status:" + fTask.getDisposition());
            return fTask.getDisposition();
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Milk Industry Letter (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Plant Industry Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genAIRPLetter() {
    var wFlowTask = "Plant Industry Review";                           // wflowTask
    var wfStatus = "Additional Info Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "ADDITIONAL INFORMATION REQUIRED";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    if (thisArr["Missing Fee"] == "CHECKED") {
        tsiVal += "Missing Fee, \n";
    }
    if (thisArr["Underpayment"] == "CHECKED") {
        tsiVal += "Underpayment, \n";
    }
    if (thisArr["Additional Information Needed"] == "CHECKED") {
        tsiVal += "Additional Information Needed, \n";
    }
    tsiVal += "Comments: " + thisArr["Comments"];
    aa.print("tsiVal:" + tsiVal);

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    return params;
}

function getwfTaskStatus(wfstr) {
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //aa.print("fTask Status:" + fTask.getDisposition());

        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
            aa.print("fTask Status:" + fTask.getDisposition());
            return fTask.getDisposition();
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Plant Industry Letter (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Ag Dev Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genAIRAGLetter() {
    var wFlowTask = "Ag Development Review";                           // wflowTask
    var wfStatus = "Additional Info Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "ADDITIONAL INFORMATION REQUIRED";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    if (thisArr["Missing Fee"] == "CHECKED") {
        tsiVal += "Missing Fee, \n";
    }
    if (thisArr["Underpayment"] == "CHECKED") {
        tsiVal += "Underpayment, \n";
    }
    if (thisArr["Additional Information Needed"] == "CHECKED") {
        tsiVal += "Additional Information Needed, \n";
    }
    tsiVal += "Comments: " + thisArr["Comments"];
    aa.print("tsiVal:" + tsiVal);

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    return params;
}

function getwfTaskStatus(wfstr) {
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //aa.print("fTask Status:" + fTask.getDisposition());

        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
            aa.print("fTask Status:" + fTask.getDisposition());
            return fTask.getDisposition();
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Ag Dev Industry Letter (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Amendment Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genAIRAMLetter() {
    var wFlowTask = "Amendment Review";                           // wflowTask
    var wfStatus = "Additional Info Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "ADDITIONAL INFORMATION REQUIRED";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    if (thisArr["Missing Fee"] == "CHECKED") {
        tsiVal += "Missing Fee, \n";
    }
    if (thisArr["Underpayment"] == "CHECKED") {
        tsiVal += "Underpayment, \n";
    }
    if (thisArr["Additional Information Needed"] == "CHECKED") {
        tsiVal += "Additional Information Needed, \n";
    }
    tsiVal += "Comments: " + thisArr["Comments"];
    aa.print("tsiVal:" + tsiVal);

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    return params;
}

function getwfTaskStatus(wfstr) {
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //aa.print("fTask Status:" + fTask.getDisposition());

        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
            aa.print("fTask Status:" + fTask.getDisposition());
            return fTask.getDisposition();
        }
    }
}
/*------------------------------------------------------------------------------------------------------/
|  Generate AIR Amendment Letter (End)
/------------------------------------------------------------------------------------------------------*/







/*------------------------------------------------------------------------------------------------------/
|  Generate Application Received Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genAppLetter() {
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "Application Received";

    var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    addParameter(params, "$$altID$$", capIDString);
    return params;
}

/*------------------------------------------------------------------------------------------------------/
|  Generate Application Received Letter (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate Renewal Application Received Letter (Start)
/------------------------------------------------------------------------------------------------------*/

function genRenewAppLetter() {
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = "RENEWAL APPLICATION RECEIVED";

    var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }


function getRecordParams4AdditonalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    loadTaskSpecific(thisArr);
    var tsiVal = "";

    addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    addParameter(params, "$$altID$$", capIDString);
    return params;
}

/*------------------------------------------------------------------------------------------------------/
|  Generate Renewal Application Received Letter (End)
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
|  Send the applicant an email indicating approval of their application (Start) AHR
/------------------------------------------------------------------------------------------------------*/
function sendEmailLicsIssuedNotice() {

    var wFlowTask = "License Issuance";
    var wfStatus = "Issued";
    var sendEmailToContactType = "Applicant";
    var FromEmailAddress = "noreply@accela.com";


    if ((getwfTaskStatus(wFlowTask) == wfStatus) && (allTasksComplete(capId))) {
        aa.print("allTasksComplete:" + allTasksComplete(capId));

        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];

            if (b3Contact["contactType"] = sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("exists(b3Contact[contactType]:" + b3Contact["email"]);
                    //send email
                    SendEmail(FromEmailAddress, toEmailAddress, "License Issued.", "<a href='www.accela.com/'>www.accela.com</a>");
                }
            }
        }
    }

}

// Send email
function SendEmail(fromEmailAddress, toEmailAddress, mSubj, mText) {
    var replyTo = fromEmailAddress;
    aa.print("emailAddress=" + toEmailAddress);

    if (toEmailAddress != null) {
        if (toEmailAddress.indexOf("@") > 0) {
            aa.sendMail(replyTo, toEmailAddress, "", mSubj, mText);
            aa.print("Successfully sent email to " + toEmailAddress);
        }
        else
            aa.print("Couldn't send email to " + toEmailAddress + ", no valid email address");
    }
}

function allTasksComplete(capID) //, stask)
{

    // returns true if any of the subtasks are active

    var taskResult = aa.workflow.getTasks(capID);

    if (taskResult.getSuccess())

    { taskArr = taskResult.getOutput(); }

    else

    { logDebug("**ERROR: getting tasks : " + taskResult.getErrorMessage()); return false; }


    for (xx in taskArr)

        if (taskArr[xx].getActiveFlag().equals("Y"))

            return false;

    return true;

}

/*------------------------------------------------------------------------------------------------------/
|  Send the applicant an email indicating approval of their application (END) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Automatically set the "License Issuance" wfStep to "Issued" (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function setLicsToIssued() {
    var wFlowTask = "License Issuance";
    var wNewflowStatus = "Issued";

    if ((isTaskReadyToIssued(wFlowTask))) {
        //Update and close task
        closeTask(wFlowTask, wNewflowStatus, "Closed via script", "");
        return true;
    }
    return false;
}

function isTaskReadyToIssued(wfstr) {
    var useProcess = false;
    var allComplt = true;

    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }

    var workflowResult = aa.workflow.getTasks(itemCap);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    { aa.print("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }

    //if (!wfstat) wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        //        aa.print("fTask.getTaskDescription()" + fTask.getTaskDescription());
        //        aa.print("fTask Status:" + fTask.getDisposition());
        //        aa.print("fTask Active Flag:" + fTask.getActiveFlag());

        if (fTask.getActiveFlag().equals("Y") && (!fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()))) {
            allComplt = false;
        }
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (allComplt) && fTask.getActiveFlag().equals("Y")) {
            aa.print("Ready to set Issued:");
            return true;
        }
    }
}

/*------------------------------------------------------------------------------------------------------/
|  Automatically set the "License Issuance" wfStep to "Issued" (End) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Compare contacts between the license and the Amendment and identify how many new locations have been added to calculate the fee (Start) AHR
/------------------------------------------------------------------------------------------------------*/
function addNewLocationfee() {

    var contType = "Additional Location";
    var amendLocCnt = 0;
    var LicsLocCnt = 0;

    appTypeResult = cap.getCapType();   //create CapTypeModel object
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");

    if (appTypeArray[1].toUpperCase().equals("AMENDMENT")) { // || appTypeArray[3].toUpperCase().equals("RENEWAL")
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];

            if (b3Contact["contactType"].toUpperCase().equals(contType.toUpperCase())) {
                amendLocCnt += 1;
                aa.print("exists(b3Contact[contactType]:" + b3Contact["contactType"]);
            }
        }


        var pCapID = getParent();

        var pConArray = getContactArray(pCapID);

        aa.print("Have the contactArray");

        for (thispCon in pConArray) {
            toEmailAddress = null;
            pB3Contact = pConArray[thispCon];

            if (pB3Contact["contactType"].toUpperCase().equals(contType.toUpperCase())) {
                LicsLocCnt += 1;
                aa.print("exists(b3Contact[contactType]:" + pB3Contact["contactType"]);
            }
        }
    }
    aa.print("amendLocCnt:" + amendLocCnt);
    aa.print("LicsLocCnt:" + LicsLocCnt);

    var diffLoc = amendLocCnt - LicsLocCnt;
    aa.print("diffLoc:" + diffLoc);

    if (diffLoc > 0) {
        var fcode = "PLNT_GRDL_01";
        var fsched = "PLNT_GRDLR";
        var fperiod = "FINAL";
        var fqty = diffLoc;
        var finvoice = "N";
        // addFee(thisFee.code, thisFee.sched, thisFee.period, thisFee.unit, "N", capId)
        addFee(fcode, fsched, fperiod, fqty, finvoice);
    }

}
/*------------------------------------------------------------------------------------------------------/
|  Compare contacts between the license and the Amendment and identify how many new locations have been added to calculate the fee (END) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Amendment Type Out of Business is submitted automatically set the workflow task "Amendment Review" status to "Approved" (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function skipApprProcess() {

    var wFlowTask = "Amendment Review";                             // wflowTask
    var wNewflowStatus = "Approved";

    appTypeResult = cap.getCapType();   //create CapTypeModel object
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");

    //Amendment/Going Out of Business/NA
    if (appTypeArray[1].toUpperCase().equals("AMENDMENT") && appTypeArray[2].toUpperCase().equals("GOING OUT OF BUSINESS")) { // || appTypeArray[3].toUpperCase().equals("RENEWAL")
        //Update task status
        updateTask(wFlowTask, wNewflowStatus, "", "");
    }
}

/*------------------------------------------------------------------------------------------------------/
|  Amendment Type Out of Business is submitted automatically set the workflow task "Amendment Review" status to "Approved" (END) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Generate License Number for Facility (Start) AHR Upd:5-17-2013
/------------------------------------------------------------------------------------------------------*/

function generateLicenseNumforFacility() {
    
    myCap = aa.cap.getCap(capId).getOutput();
    myAppTypeString = myCap.getCapType().toString();
    myAppTypeArray = myAppTypeString.split("/");

    if (myAppTypeArray[3] == "Application") {
        parentLic = getParentLicenseCapID(capId);
        pLicArray = String(parentLic).split("-");
        var parentLicID = getParent();
        aa.print("parentLicID:" + parentLicID.getCustomID());
    } else {
        var parentLicID = getParentCapID4Renewal();
        aa.print("parentLicID:" + parentLicID.getCustomID());
    }


    var tblName = "FACILITY LIST";
    var sColName = "License #";

    //load FACILITY LIST asit
    var arrASIT = loadASITable(tblName, parentLicID);

    if (typeof (arrASIT) == "object") {
        if (arrASIT.length > 0) {
            aa.print("arrASIT.length:" + arrASIT.length);
            updateFacilityListASITable(parentLicID, tblName, sColName);

        }
    }
    
}

function updateFacilityListASITable(pFromCapID, tableName, sColName) {

    var itemCap = pFromCapID;
    //used for permit number
    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();
    var maxPermtFX = 0;

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;

        if (!tn.equals(tableName)) {
            continue;
        }
        aa.print("Table Name:" + tn);

        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
                        var tempObject = new Array();  // clear the temp obj
                        numrows++;
                    }
                    var tcol = tsmcoli.next();
                    var tval = tsmfldi.next();

                    //add license number
                    if (tcol.getColumnName().equals(sColName)) {
                        aa.print("tcol:" + tcol.getColumnName() + ":" + tval);
                        //aa.print("tval.length:" + tval.length());
                        if (isEmpty(tval) || isBlank(tval)) {
                            if (maxPermtFX != 0) {
                                maxPermtFX++;
                                tval = pFromCapID.getCustomID() + "-" + maxPermtFX;
                            } else {
                                maxPermtFX = parseInt(getNextNum(ta, tableName, sColName));
                                tval = pFromCapID.getCustomID() + "-" + maxPermtFX;
                            }
                            aa.print("Add Number::" + tval + " -- to: " + pFromCapID.getCustomID());
                        }
                    }
                    var readOnly = 'N';
                    if (readOnlyi.hasNext()) {
                        readOnly = readOnlyi.next();
                    }

                    var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                    tempObject[tcol.getColumnName()] = fieldInfo;
                }

                tempArray.push(tempObject);  // end of record
            }
        }

        var copyStr = "" + tn + " = tempArray";

        if (tblName.equals(tableName)) {
            if (numrows > 0) {
                //remove table
                removeSingleASITable(tblName, pFromCapID);

                //add table
                addSingleASITable(tblName, tempArray, pFromCapID);
            }
        }
        eval(copyStr);  // move to table name
    }

}


function getNextNum(ta, tableName, sColName) {

    //ta = gm.getTablesArray()
    var tai = ta.iterator();
    var maxSFX = 0;

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;

        if (!tn.equals(tableName)) {
            continue;
        }
        aa.print("Table Name:" + tn);

        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
                        var tempObject = new Array();  // clear the temp obj
                        numrows++;
                    }
                    var tcol = tsmcoli.next();
                    var tval = tsmfldi.next();

                    //add permit number
                    if (tcol.getColumnName().equals(sColName)) {
                        if (tval != null) {
                            if (tval.lastIndexOf("-") > 0) {
                                var strVal = tval.substr(tval.lastIndexOf("-") + 1);
                                aa.print("strVal: " + strVal);
                                if (parseInt(strVal) > parseInt(maxSFX)) {
                                    maxSFX = strVal;
                                }
                            }
                        }
                    }
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
        }

        var copyStr = "" + tn + " = tempArray";
        eval(copyStr);  // move to table name
    }
    maxSFX++;
    return maxSFX;
}

function removeSingleASITable(tableName) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValues is an associative array of values.  All elements MUST be strings.
    var itemCap = capId
    if (arguments.length > 1)
        itemCap = arguments[1]; // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName, itemCap, currentUserID)

    if (!tssmResult.getSuccess())
    { aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()); return false }
    else
        aa.print("Successfully removed all rows from ASI Table: " + tableName);

}

function addSingleASITable(tableName, tableValueArray) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
    var itemCap = capId
    if (arguments.length > 2)
        itemCap = arguments[2]; // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

    if (!tssmResult.getSuccess())
    { aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()); return false }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field

    for (thisrow in tableValueArray) {

        var col = tsm.getColumns()
        var coli = col.iterator();

        while (coli.hasNext()) {
            var colname = coli.next();

            if (typeof (tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
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

    var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

    if (!addResult.getSuccess())
    { aa.print("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()); return false }
    else
        aa.print("Successfully added record to ASI Table: " + tableName);

}
/*------------------------------------------------------------------------------------------------------/
|  Generate License Number for Facility (END) AHR
/------------------------------------------------------------------------------------------------------*/
function doStandardChoiceActions(stdChoiceEntry, doExecution, docIndent) {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    var lastEvalTrue = false;
    stopBranch = false;  // must be global scope

    logDebug("Executing (via override function): " + stdChoiceEntry + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds")

    var pairObjArray = getScriptAction(stdChoiceEntry);
    if (!doExecution) docWrite(stdChoiceEntry, true, docIndent);
    for (xx in pairObjArray) {
        doObj = pairObjArray[xx];
        if (doExecution) {
            if (doObj.enabled) {

                if (stopBranch) {
                    stopBranch = false;
                    break;
                }

                logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Criteria : " + doObj.cri, 2);

                try {

                    if (eval(token(doObj.cri)) || (lastEvalTrue && doObj.continuation)) {
                        logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Action : " + doObj.act, 2);

                        eval(token(doObj.act));
                        lastEvalTrue = true;
                    }
                    else {
                        if (doObj.elseact) {
                            logDebug(aa.env.getValue("CurrentUserID") + " : " + stdChoiceEntry + " : #" + doObj.ID + " : Else : " + doObj.elseact, 2);
                            eval(token(doObj.elseact));
                        }
                        lastEvalTrue = false;
                    }
                }
                catch (err) {
                    showDebug = 3;
                    logDebug("**ERROR An error occured in the following standard choice " + stdChoiceEntry + "#" + doObj.ID + "  Error:  " + err.message);
                }
            }
        }
        else // just document
        {
            docWrite("|  ", false, docIndent);
            var disableString = "";
            if (!doObj.enabled) disableString = "<DISABLED>";

            if (doObj.elseact)
                docWrite("|  " + doObj.ID + " " + disableString + " " + doObj.cri + " ^ " + doObj.act + " ^ " + doObj.elseact, false, docIndent);
            else
                docWrite("|  " + doObj.ID + " " + disableString + " " + doObj.cri + " ^ " + doObj.act, false, docIndent);

            for (yy in doObj.branch) {
                doStandardChoiceActions(doObj.branch[yy], false, docIndent + 1);
            }
        }
    } // next sAction
    if (!doExecution) docWrite(null, true, docIndent);
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    logDebug("Finished: " + stdChoiceEntry + ", Elapsed Time: " + ((thisTime - startTime) / 1000) + " Seconds");
}

/*------------------------------------------------------------------------------------------------------/
|  All completed determine the quantity of fees based on how many products have been created (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function calculateLicenseFees() {

    myCap = aa.cap.getCap(capId).getOutput();
    myAppTypeString = myCap.getCapType().toString();
    myAppTypeArray = myAppTypeString.split("/");

    //table to use the product quanity
    var tblName = "PRODUCT";
    var totalProducts = 0;

    //fee variables
    var fcode = "PLNT_SPI";
    var fsched = "PLNT_SPI";
    var fperiod = "FINAL";
    var fqty = 1;
    var finvoice = "N";

    //get the product table
    var arrASIT = loadASITable(tblName);

    if ((!isEmpty(arrASIT.length) || isBlank(!arrASIT.length))) {
        totalProducts = arrASIT.length;
    }

    if (totalProducts > 0) {
        //check the type
        if (myAppTypeArray[2].toUpperCase().equals("SOIL OR PLANT INOCULANT") || myAppTypeArray[2].toUpperCase().equals("ADD PRODUCT")) {
            if (myAppTypeArray[3].toUpperCase().equals("LICENSE") || myAppTypeArray[3].toUpperCase().equals("RENEWAL") ||
            myAppTypeArray[3].toUpperCase().equals("APPLICATION") || myAppTypeArray[3].toUpperCase().equals("NA")) {
                //aa.print("Adding fees");

                //set the quanity
                fqty = totalProducts;

                // add Fee 
                addFee(fcode, fsched, fperiod, fqty, finvoice);
            }
        }
    }
}

/*------------------------------------------------------------------------------------------------------/
|  All completed determine the quantity of fees based on how many products have been created (End) AHR
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
|  Generate License Number for Product (Start) AHR Upd:5-16-2013
/------------------------------------------------------------------------------------------------------*/
function createLicenseNumforProduct() {
    
    myCap = aa.cap.getCap(capId).getOutput();
    myAppTypeString = myCap.getCapType().toString();
    myAppTypeArray = myAppTypeString.split("/");

    if (myAppTypeArray[3] == "Application") {
        parentLic = getParentLicenseCapID(capId);
        pLicArray = String(parentLic).split("-");
        var parentLicID = getParent(); 
        aa.print("parentLicID:" + parentLicID);
    } else {
        var parentLicID = getParentCapID4Renewal();
        aa.print("parentLicID:" + parentLicID.getCustomID());
    }

    var tblName = "LIME BRAND";
    var sColName = "License #";

    //load LIME BRAND asit
    var arrASIT = loadASITable(tblName, parentLicID);

    if (typeof (arrASIT) == "object") {
        if (arrASIT.length > 0) {
            aa.print("arrASIT.length:" + arrASIT.length);
            updateLimeBrandASITable(parentLicID, tblName, sColName);
        }
    }
}

function updateLimeBrandASITable(pFromCapID, tableName, sColName) {

    var itemCap = pFromCapID;
    //used for permit number
    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();
    var maxPermtFX = 0;

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;

        if (!tn.equals(tableName)) {
            continue;
        }
        aa.print("Table Name:" + tn);

        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
                        var tempObject = new Array();  // clear the temp obj
                        numrows++;
                    }
                    var tcol = tsmcoli.next();
                    var tval = tsmfldi.next();

                    //add license number
                    if (tcol.getColumnName().equals(sColName)) {
                        aa.print("tcol:" + tcol.getColumnName() + ":" + tval);
                        //aa.print("tval.length:" + tval.length());
                        if (isEmpty(tval) || isBlank(tval)) {
                            if (maxPermtFX != 0) {
                                maxPermtFX++;
                                tval = pFromCapID.getCustomID() + "-" + maxPermtFX;
                            } else {
                                maxPermtFX = parseInt(getNextNum(ta, tableName, sColName));
                                tval = pFromCapID.getCustomID() + "-" + maxPermtFX;
                            }
                            aa.print("Add Number::" + tval + " -- to: " + pFromCapID.getCustomID());
                        }
                    }
                    var readOnly = 'N';
                    if (readOnlyi.hasNext()) {
                        readOnly = readOnlyi.next();
                    }

                    var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                    tempObject[tcol.getColumnName()] = fieldInfo;
                }

                tempArray.push(tempObject);  // end of record
            }
        }

        var copyStr = "" + tn + " = tempArray";

        if (tblName.equals(tableName)) {
            if (numrows > 0) {
                //remove table
                removeSingleASITable(tblName, pFromCapID);

                //add table
                addSingleASITable(tblName, tempArray, pFromCapID);
            }
        }
        eval(copyStr);  // move to table name
    }

}


/*------------------------------------------------------------------------------------------------------/
|  Generate License Number for Product (END) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Validate Commercial Fertilizer License (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function validateComFertilizerLicenseNum(licNumVal) {

    if (!isEmpty(licNumVal) && !isBlank(licNumVal)) {

        //check to see if license is valid
        var licCap = aa.cap.getCapID(licNumVal).getOutput();

        if (licCap == null) {
            return false;
        }

        //check to see if Licenses/Plant/Commercial Fertilizer/License
        myCap = aa.cap.getCap(licCap).getOutput();
        myAppTypeString = myCap.getCapType().toString();
        myAppTypeArray = myAppTypeString.split("/");

        if (myAppTypeString != "Licenses/Plant/Commercial Fertilizer/License") {
            aa.print("Invalid license type");
            return false;
        }

        b1ExpResult = aa.expiration.getLicensesByCapID(licCap)
        if (b1ExpResult.getSuccess()) {
            this.b1Exp = b1ExpResult.getOutput();
            tmpDate = this.b1Exp.getExpDate();
            var sysDate = aa.date.getCurrentDate();
            var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");

            if (tmpDate)
                this.b1ExpDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
            this.b1Status = this.b1Exp.getExpStatus();

            aa.print("this.b1ExpDate:" + this.b1ExpDate + " sysDate:" + sysDateMMDDYYYY);
            aa.print("this.b1Status:" + this.b1Status);

            if (convertDate(sysDateMMDDYYYY) < convertDate(this.b1ExpDate)) {
                var statAbouttoExpr = "About to Expire";
                var statActive = "Active";

                if (this.b1Status == statActive || this.b1Status == statAbouttoExpr) {
                    aa.print("Valid Record.");
                    return true;
                } else {
                    aa.print("Invalid Record status");
                    return false;
                }
            } else {
                aa.print("Invalid Record");
                return false;
            }
        }
    }
    return false;
}

/*------------------------------------------------------------------------------------------------------/
|  Validate Commercial Fertilizer License (End) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|   Waive the license Fee (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function waveLicenseFee() {

        var fcode = "";
        var fsched = "";
        var fqty = 0;
        var feeComment = "Waived Fee";

        //load the fees for current cap
        var feeA = loadFees(capId);

        for (x in feeA) {
            thisFee = feeA[x];
            aa.print("We have a fee " + thisFee.code + " status : " + thisFee.status + " sequence:" + thisFee.sequence);
            var feeSeq = thisFee.sequence;
            var fcode = thisFee.code;
            var editResult = aa.finance.editFeeItemUnit(capId, fqty,feeSeq);
            feeUpdated = true;
            if (editResult.getSuccess()) {
                aa.print("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);

                //get the fee item
                fsm = aa.finance.getFeeItemByPK(capId, feeSeq).getOutput().getF4FeeItem();

                //update note field
                fsm.setFeeNotes(feeComment);
                aa.finance.editFeeItem(fsm)

                aa.print("Updated Notes on Existing Fee Item: " + fcode + " to Notes: " + feeComment);

            }
        }
    
}

/*------------------------------------------------------------------------------------------------------/
|   Waive the license Fee (End) AHR
/------------------------------------------------------------------------------------------------------*/

function calExpireDate(pcapId) {
    b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
            //logDebug("Previous expiraton date: " +expDate);
            var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
            var expYear = expDate.getYear();
            //logDebug("EXPPPP YEAR "+b1ExpDate);

            var newExpdate = new Date();
            newExpdate.setMonth(12);
            newExpdate.setDate(0);
            var yy=0;
            if((expYear%2)==0)
            {
                 yy = expYear + 2;

            }
            else
            {
                 yy=expYear + 1;
            }
            //logDebug("Expiration year: " + yy);
            newExpdate.setFullYear(yy);

            var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
            var expAADate = aa.date.parseDate(edate);
            b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            //logDebug("Updated renewal to " + expAADate);
        }

    }    
}

/*------------------------------------------------------------------------------------------------------/
|   License Expiration Date (End) AHR
/------------------------------------------------------------------------------------------------------*/

function addContactStdCondition(contSeqNum, cType, cDesc) {

    var foundCondition = false;
    var javascriptDate = new Date();
    var javautilDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());


    cStatus = "Applied";
    if (arguments.length > 3)
        cStatus = arguments[3]; // use condition status in args

    if (!aa.capCondition.getStandardConditions) {
        logDebug("addAddressStdCondition function is not available in this version of Accela Automation.");
    }
    else {
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        for (i = 0; i < standardConditions.length; i++)
            if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
            {
                standardCondition = standardConditions[i]; // add the last one found

                foundCondition = true;

                if (!contSeqNum) // add to all reference address on the current capId
                {
                    var capContactResult = aa.people.getCapContactByCapID(capId);
                    if (capContactResult.getSuccess()) {
                        var Contacts = capContactResult.getOutput();
                        for (var contactIdx in Contacts) {
                            var contactNbr = Contacts[contactIdx].getCapContactModel().getPeople().getContactSeqNumber();
                            if (contactNbr) {
                                var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
                                newCondition.setServiceProviderCode(aa.getServiceProviderCode());
                                newCondition.setEntityType("CONTACT");
                                newCondition.setEntityID(contactNbr);
                                newCondition.setConditionDescription(standardCondition.getConditionDesc());
                                newCondition.setConditionGroup(standardCondition.getConditionGroup());
                                newCondition.setConditionType(standardCondition.getConditionType());
                                newCondition.setConditionComment(standardCondition.getConditionComment());
                                newCondition.setImpactCode(standardCondition.getImpactCode());
                                newCondition.setConditionStatus(cStatus);
                                newCondition.setAuditStatus("A");
                                newCondition.setIssuedByUser(systemUserObj);
                                newCondition.setIssuedDate(javautilDate);
                                newCondition.setEffectDate(javautilDate);
                                newCondition.setAuditID(currentUserID);
                                var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);

                                if (addContactConditionResult.getSuccess()) {
                                    logDebug("Successfully added reference contact (" + contactNbr + ") condition: " + cDesc);
                                }
                                else {
                                    logDebug("**ERROR: adding reference contact (" + contactNbr + ") condition: " + addContactConditionResult.getErrorMessage());
                                }
                            }
                        }
                    }
                }
                else {
                    var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
                    newCondition.setServiceProviderCode(aa.getServiceProviderCode());
                    newCondition.setEntityType("CONTACT");
                    newCondition.setEntityID(contSeqNum);
                    newCondition.setConditionDescription(standardCondition.getConditionDesc());
                    newCondition.setConditionGroup(standardCondition.getConditionGroup());
                    newCondition.setConditionType(standardCondition.getConditionType());
                    newCondition.setConditionComment(standardCondition.getConditionComment());
                    newCondition.setImpactCode(standardCondition.getImpactCode());
                    newCondition.setConditionStatus(cStatus);
                    newCondition.setAuditStatus("A");

                    newCondition.setIssuedByUser(systemUserObj);
                    newCondition.setIssuedDate(javautilDate);
                    newCondition.setEffectDate(javautilDate);

                    newCondition.setAuditID(currentUserID);
                    var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);

                    if (addContactConditionResult.getSuccess()) {
                        logDebug("Successfully added reference contact (" + contSeqNum + ") condition: " + cDesc);
                    }
                    else {
                        logDebug("**ERROR: adding reference contact (" + contSeqNum + ") condition: " + addContactConditionResult.getErrorMessage());
                    }
                }
            }
    }
    if (!foundCondition) logDebug("**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
}

/*------------------------------------------------------------------------------------------------------/
| Close all related licenses and update their license status to "Inactive" (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function closeRelatedLicenses() {
    var contactType = "Applicant";
    var fullName = "";
    var servProvider = "agm";
    var newAppStatus = "Inactive";


    var capContactResult = aa.people.getCapContactByCapID(capId);

    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType())) {
                if (Contacts[yy].getCapContactModel().getRefContactNumber() != null) {

                    //get full name
                    fullName = Contacts[yy].getPeople().firstName + " " + Contacts[yy].getPeople().lastName;

                    // create a people model
                    var pModel = aa.people.createPeopleModel();
                    if (pModel.getSuccess()) {
                        var attrs = pModel.getOutput();

                        // setup the attributes of the people object
                        attrs.setFullName(fullName);
                        attrs.setServiceProviderCode(servProvider);   // agency code is required
                        attrs.setContactType(contactType);    //  contact type is required

                        // var r = aa.people.createPeople(p.getPeopleModel());  // need to pass the peopleModel object to this method

                        var cResult = aa.people.getCapIDsByRefContact(attrs);  // needs 7.1

                        if (cResult.getSuccess()) {
                            var a = cResult.getOutput();
                            for (var j in a) {
                                ccapId = a[j].getCapID();

                                //get app type
                                var ArrCapId = ccapId.toString().split("-");

                                licCapId = aa.cap.getCapID(ArrCapId[0], ArrCapId[1], ArrCapId[2]).getOutput();
                                aa.print("Cap Custom ID:" + licCapId.getCustomID());

                                var cap = aa.cap.getCap(ccapId).getOutput(); //
                                var appTypeResult = cap.getCapType().toString();

                                var arrAppType = appTypeResult.split("/");
                                //aa.print("appType:" + arrAppType[3] + "--Status:" + cap.getCapStatus());

                                if (arrAppType[3].toUpperCase().equals("LICENSE")) {
                                    aa.print("appType:" + arrAppType[3] + "--Status:" + cap.getCapStatus());
                                    if (!cap.getCapStatus().toUpperCase().equals("CANCELED")) {
                                        aa.print("Status:" + cap.getCapStatus());
                                        b1ExpResult = aa.expiration.getLicensesByCapID(licCapId);
                                        if (b1ExpResult.getSuccess()) {
                                            var b1Exp = b1ExpResult.getOutput();

                                            // update expiration status
                                            b1Exp.setExpStatus(newAppStatus);
                                            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());

                                            aa.print(licCapId.getCustomID() + ": Update expiration status: " + newAppStatus);

                                            var capStatus = b1Exp.getExpStatus();

                                            // update CAP status
                                            if (capStatus != "Canceled") {
                                                updateAppStatus(newAppStatus, "", licCapId);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/*------------------------------------------------------------------------------------------------------/
|   Close all related licenses and update their license status to "Inactive" (End) AHR
/------------------------------------------------------------------------------------------------------*/

function calcMilkDlrLicenseFee(poundsSold) {

    var licenseFee = 0;

    if (poundsSold <= 4000) return 100;

    if (poundsSold > 740000) return 7500;

    licenseFee = Math.floor(poundsSold / 4000) * 40 + 100;

    return licenseFee;

}

function copyContactAddressToAddress(conObj, conAddrType, trxAddrType) { // optional fromCapId, optional toCapId

    itemCap = capId;
    toCapId = capId;

    if (arguments.length == 4) {
        itemCap = arguments[3]; // use cap ID specified in args
    }

    if (arguments.length == 5) {
        toCapId = arguments[4]; // use cap ID specified in args
    }

    var contactAddressModelArr = conObj.people.getContactAddressList();

    // loop through the array list to find the conAddrType address
    for (var index = 0; index < contactAddressModelArr.size(); index++) {
        var contactAddress = contactAddressModelArr.get(index);

        if (contactAddress.getAddressType().toUpperCase() == conAddrType.toUpperCase()) {

            addressModel = aa.address.createRefAddressScriptModel();

            addressModel.getRefAddressModel().setFullAddress(contactAddress.getFullAddress());
            addressModel.getRefAddressModel().setAddressLine1(contactAddress.getAddressLine1());
            addressModel.getRefAddressModel().setAddressLine2(contactAddress.getAddressLine2());
            addressModel.getRefAddressModel().setCounty(contactAddress.getAddressLine3());
            addressModel.getRefAddressModel().setHouseNumberStart(contactAddress.getHouseNumberStart());
            addressModel.getRefAddressModel().setHouseNumberEnd(contactAddress.getHouseNumberEnd());
            addressModel.getRefAddressModel().setHouseNumberAlphaStart(contactAddress.getHouseNumberAlphaStart());
            addressModel.getRefAddressModel().setHouseNumberAlphaEnd(contactAddress.getHouseNumberAlphaEnd());
            addressModel.getRefAddressModel().setLevelPrefix(contactAddress.getLevelPrefix());
            addressModel.getRefAddressModel().setLevelNumberStart(contactAddress.getLevelNumberStart());
            addressModel.getRefAddressModel().setLevelNumberEnd(contactAddress.getLevelNumberEnd());
            addressModel.getRefAddressModel().setValidateFlag(contactAddress.getValidateFlag());
            addressModel.getRefAddressModel().setStreetDirection(contactAddress.getStreetDirection());
            addressModel.getRefAddressModel().setStreetPrefix(contactAddress.getStreetPrefix());
            addressModel.getRefAddressModel().setStreetName(contactAddress.getStreetName());
            addressModel.getRefAddressModel().setStreetSuffix(contactAddress.getStreetSuffix());
            addressModel.getRefAddressModel().setUnitType(contactAddress.getUnitType());
            addressModel.getRefAddressModel().setUnitStart(contactAddress.getUnitStart());
            addressModel.getRefAddressModel().setUnitEnd(contactAddress.getUnitEnd());
            addressModel.getRefAddressModel().setStreetSuffixdirection(contactAddress.getStreetSuffixDirection());
            addressModel.getRefAddressModel().setCountryCode(contactAddress.getCountryCode());
            addressModel.getRefAddressModel().setCity(contactAddress.getCity());
            addressModel.getRefAddressModel().setState(contactAddress.getState());
            addressModel.getRefAddressModel().setZip(contactAddress.getZip());
            //addressModel.getRefAddressModel().setRefAddressId(contactAddress.getAddressID());
            addressModel.getRefAddressModel().setAuditStatus("A");
            addressModel.getRefAddressModel().setAuditID("ADMIN");
            addressModel.getRefAddressModel().setAuditDate(aa.util.now());
            addressModel.getRefAddressModel().setAddressType(trxAddrType); // doesn't work, have to set it below.

            createAddressResult = aa.address.createAddressWithRefAddressModel(toCapId, addressModel.getRefAddressModel());

            if (createAddressResult.getSuccess()) {
                logDebug("Successfully copied the " + contactAddress.getStreetName() + " " + conAddrType + " contact address on the " + conObj + " contact to the address tab.");

                var newAddModel = aa.address.getAddressByPK(toCapId, createAddressResult.getOutput()).getOutput().getAddressModel();
                newAddModel.setAddressType(trxAddrType);
                var editAddResult = aa.address.editAddress(newAddModel);

                if (editAddResult.getSuccess())
                    logDebug("Updated address type to " + trxAddrType);
                else
                    logDebug("Error updating address type to " + trxAddrType + " : " + editAddResult.getErrorMessage());

                return true;
            } else {
                logDebug("Could not copy the contact address to the address: " + createAddressResult.getErrorType() + ":" + createAddressResult.getErrorMessage());
                return false;
            }
        }
    }

    logDebug("Error copying contact address to address");
    return false;
}

function getCapsByContAndAddress(conObj, conAddrType) {

    // retrieves caps with matching contact names and trx address matches contact address
    itemCap = capId;
    if (arguments.length == 3) {
        itemCap = arguments[2]; // use cap ID specified in args
    }

    var returnArray = new Array();

    var theContact = conObj;

    var addr = null;
    var pmcal = theContact.addresses;
    if (pmcal) {
        for (var thisPm in pmcal) {
            if (conAddrType == String(pmcal[thisPm].getAddressType())) {
                addr = pmcal[thisPm];
				logDebug("addr = " + addr);
                if (addr) {
                    caps = aa.cap.getCapListByDetailAddress(addr.getStreetName(), addr.getHouseNumberStart() ? parseInt(addr.getHouseNumberStart()) : null, addr.getStreetSuffix(), addr.getZip(), addr.getStreetSuffixDirection(), null).getOutput();

                    if (caps && caps.length) {
                        logDebug("found " + caps.length + " record(s) at this address: " + addr.getHouseNumberStart() + " " + addr.getStreetSuffixDirection() + " " + addr.getStreetName() + " " + addr.getStreetSuffix() + " " + addr.getZip());
                        for (var iii in caps) {
                            var contactArray2 = getContactObjs(caps[iii].getCapID());
                            for (var ic in contactArray2) {
                                logDebug("comparing " + theContact + " ==> " + contactArray2[ic]);
                                if (contactArray2[ic].equals(theContact))
                                    returnArray.push(caps[iii]);
                            }
                        }
                    }
                }
                else {
                    logDebug("no records found at address: " + addr.getHouseNumberStart() + " " + addr.getStreetSuffixDirection() + " " + addr.getStreetName() + " " + addr.getStreetSuffix() + " " + addr.getZip());
                }
            }
        }
    }



    if (returnArray.length) {
        logDebug("returning " + returnArray.length + " records");
        return returnArray;
    }
    else {
        logDebug("no address found for contact " + conObj + " : " + conAddrType);
        return false;
    }
}

/*------------------------------------------------------------------------------------------------------/
| if inspection has performed within 2 years set "Inspection" in Application or Renewal to "Completed" (Start) AHR Upd:6/20/2013
/------------------------------------------------------------------------------------------------------*/

function hasInspectionPerformed() {
    var wftsk = "Inspection";
    var wftskStatus = "Complete";
    var inspType = "Nursery Grower";
    var inspStatus = "Completed";
    var appType = "Establishment";
    var pEstCapId=null;

    //check to see if inspection wftask is active
    if (isTaskActive(wftsk)) {
        aa.print("isTaskActive: Active");

        capTypeStr = aa.cap.getCap(capId).getOutput().getCapType().toString();
        capTypeArray = capTypeStr.split("/");

        aa.print("capTypeArray:" + capTypeArray[3]);

        // get parent capid(Establishment)
        if (capTypeArray[3].equals("Application")) { //Renewal"
            pEstCapId = getEstParent(appType, capId);
        }else if(capTypeArray[3].equals("Renewal")) { 
            //get parent license
            var parentLic = getParentLicenseCapID(capId); // getMatchingParent(appGroup, appType, appSubtype, appCategory);
            aa.print("Parent Lic" + parentLic.getCustomID()); //Test for Inspection Establishment
            pLicArray = String(parentLic).split("-");
            var parentLicenseCAPID = aa.cap.getCapID(pLicArray[0], pLicArray[1], pLicArray[2]).getOutput();
            aa.print("parentLicenseCAPID:" + parentLicenseCAPID.getCustomID());

            pEstCapId = getEstParent(appType, parentLicenseCAPID);
            aa.print("pEstCapId:" + pEstCapId);
        }

        if (pEstCapId != null) {
            aa.print("pEstCapId:" + pEstCapId.getCustomID());

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
                    aa.print("inspArray[i].getInspectionType():" + inspArray[i].getInspectionType() + "--" + inspArray[i].getInspectionStatus());
                    
                    //get inspection
                    iObjResult = aa.inspection.getInspection(pEstCapId, inspArray[i].getIdNumber());
                    if (!iObjResult.getSuccess())
                    { 
                        aa.print("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage()); 
                        return false; 
                    }else{
                        //get the inspection object
                        inspResultObj = iObjResult.getOutput();

                        // get inspection date
                        inspRealResultDate = dateFormatted(inspResultObj.getInspectionDate().getMonth(),
                        inspResultObj.getInspectionDate().getDayOfMonth(), inspResultObj.getInspectionDate().getYear(), "MM/DD/YYYY");

                        aa.print("inspRealResultDate:" + inspRealResultDate);

                        aa.print("dateDiff:" + getDateDiff(inspRealResultDate));
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

function getEstParent(pAppType,appRenewID) {
    // returns the capId of parent cap Establishment
    
    var i = 1;
    while (true) {
        if (!(aa.cap.getProjectParents(appRenewID, i).getSuccess()))
            break;

        i += 1;
    }
    i -= 1;

    getCapResult = aa.cap.getProjectParents(appRenewID, i);
    myArray = new Array();
    
    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();

        if (parentArray.length) {
            for (x in parentArray) {
                if (pAppType != null) {
                    //get the app type
                    matchCap = aa.cap.getCap(parentArray[x].getCapID()).getOutput();
                    matchArray = matchCap.getCapType().toString().split("/");

                    //If parent type matches appType return capid
                    if (matchArray[1].equals(pAppType)) {
                        //aa.print("parentArray[x].getCapID()" + parentArray[x].getCapID());
                        return parentArray[x].getCapID();
                    }
                }
            }

            return null;
        }
        else {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return null;
        }
    }
    else {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return null;
    }
}

function getDateDiff(DatetoComp) {

    var date1 = new Date(DatetoComp);
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
    //aa.print("sysDateMMDDYYYY:" + sysDateMMDDYYYY + "--DatetoComp:" + DatetoComp);

    var date2 = new Date(sysDateMMDDYYYY);
    var diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
    //aa.print("diffDays:" + diffDays);
    return diffDays;
}

function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
    var mth = "";
    var day = "";
    var ret = "";
    if (pMonth > 10)
        mth = pMonth.toString();
    else
        mth = "0" + pMonth.toString();

    if (pDay > 10)
        day = pDay.toString();
    else
        day = "0" + pDay.toString();

    if (pFormat == "YYYY-MM-DD")
        ret = pYear.toString() + "-" + mth + "-" + day;
    else
        ret = "" + mth + "/" + day + "/" + pYear.toString();

    return ret;
}

/*------------------------------------------------------------------------------------------------------/
|   if inspection has performed within 2 years set "Inspection" in Application or Renewal to "Completed" (End) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| Calucalting Expiration Date ,Every Year Dec 31(Start)
/------------------------------------------------------------------------------------------------------*/
function cCompostExpireDate(pcapId) {
    b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
            var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
            var expYear = expDate.getYear();
            //aa.print("EXPPPP YEAR "+b1ExpDate);

            var newExpdate = new Date();
            newExpdate.setMonth(12);
            newExpdate.setDate(0);
            var yy=0;
            if((expYear%2)==0)
            {
                 yy = expYear + 2;

            }
            else
            {
                 yy=expYear + 1;
            }
            newExpdate.setFullYear(yy);

            var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
            var expAADate = aa.date.parseDate(edate);
            b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            aa.print("Updated renewal to " + expAADate);

        }

    }

}

/*------------------------------------------------------------------------------------------------------/
|   Calucalting Expiration Date (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| Calculating Expiration Date ,Every Other Year Dec 31(Start)
/------------------------------------------------------------------------------------------------------*/
function cFertilizerExpireDate(pcapId) {
    //logDebug("Inside cFertilizerExpireDate");
    //logDebug("Parent ID: " +pcapId);
    b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
            //logDebug("Previous expiraton date: " +expDate);
            var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
            var expYear = expDate.getYear();
            //aa.print("EXPPPP YEAR "+b1ExpDate);

            var newExpdate = new Date();
            newExpdate.setMonth(12);
            newExpdate.setDate(0);
            var yy=0;
            if((expYear%2)==0)
            {
                 yy = expYear + 2;

            }
            else
            {
                 yy=expYear + 1;
            }
            //logDebug("Expiration year: " + yy);
            newExpdate.setFullYear(yy);

            var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
            var expAADate = aa.date.parseDate(edate);
            b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            //logDebug("Updated renewal to " + expAADate);

        }

    }

}



/*------------------------------------------------------------------------------------------------------/
|   Calculating Expiration Date (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Set expiration date to Dec 31 after Ammonium Nitrate Fertilizer license is created (Start) AHR
/------------------------------------------------------------------------------------------------------*/

function setLicExpDate4AmmoniumNitFertLics() {

    var pcapId = getParent();
    aa.print("CapID:" + pcapId.getCustomID());
    b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
            //new date obj
            var newExpdate = new Date();
            newExpdate.setMonth(12);
            newExpdate.setDate(0);
            newExpdate.setFullYear(sysDate.getYear());

            //aa.print("getYear():" + sysDate.getYear());
            var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
            var expAADate = aa.date.parseDate(edate);
            b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            aa.print("Updating expiration date to " + newExpdate);

        }

    }

}

/*------------------------------------------------------------------------------------------------------/
|  Set expiration date to Dec 31 after Ammonium Nitrate Fertilizer license is created (Start) AHR
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  ACA Functions (Start) 
/------------------------------------------------------------------------------------------------------*/

function editAppSpecific4ACA(itemName, itemValue) {

    var i = cap.getAppSpecificInfoGroups().iterator();

    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
                    field.setChecklistComment(itemValue);
                }
            }
        }
    }
}

/*------------------------------------------------------------------------------------------------------/
|  ACA Functions (End) 
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Update parent product cap. Copy ASI and ASIT (Start) 
/------------------------------------------------------------------------------------------------------*/

function updateProduct() {

    var pProdCapID = getParent();
    aa.print("pProdCapID: " + pProdCapID.getCustomID());

    //load asi
    loadAppSpecific(AInfo, capId);

    //copy asi from child to parent
    copyAppSpecific(pProdCapID);

    //copy asit from child to parent
    CopyASITablesFromParent(capId, pProdCapID); //pFromCapID, pToCapId

    aa.print("Parent product updated.");

}

/*------------------------------------------------------------------------------------------------------/
|  Update parent product cap. Copy ASI and ASIT (End) 
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| ContactObj
/------------------------------------------------------------------------------------------------------*/

    
function getContactObj(itemCap,typeToLoad)
{
    // returning the first match on contact type
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel")   { // page flow script 
        var capContactArray = cap.getContactsGroup().toArray() ;
        }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }
    
    if (capContactArray) {
        for (var yy in capContactArray) {
            if (capContactArray[yy].getPeople().contactType.toUpperCase().equals(typeToLoad.toUpperCase())) {
                logDebug("getContactObj returned the first contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }
    
    logDebug("getContactObj could not find a contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
    return false;
            
}

function getContactObjs(itemCap) // optional typeToLoad, optional return only one instead of Array?
{
    var typesToLoad = false;
    if (arguments.length == 2) typesToLoad = arguments[1];
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel")   { // page flow script 
        var capContactArray = cap.getContactsGroup().toArray() ;
        }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
            }
        }
    
    if (capContactArray) {
        for (var yy in capContactArray) {
            if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {
                cArray.push(new contactObj(capContactArray[yy]));
            }
        }
    }
    
    logDebug("getContactObj returned " + cArray.length + " contactObj(s)");
    return cArray;
            
}
    
function contactObj(ccsm)  {

    this.people = null;         // for access to the underlying data
    this.capContact = null;     // for access to the underlying data
    this.capContactScript = null;   // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses
        
    this.capContactScript = ccsm;
    if (ccsm)  {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
            }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();
        }
        
        this.asiObj = this.people.getAttributes().toArray();
        for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1].attributeValue;
        //this.primary = this.capContact.getPrimaryFlag().equals("Y");
        this.primary = this.capContact.getPrimaryFlag() && this.capContact.getPrimaryFlag().equals("Y");
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
            }
    }       
        this.toString = function() { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary;  }
        
        this.getEmailTemplateParams = function (params) {
            addParameter(params, "$$LastName$$", this.people.getLastName());
            addParameter(params, "$$FirstName$$", this.people.getFirstName());
            addParameter(params, "$$MiddleName$$", this.people.getMiddleName());
            addParameter(params, "$$BusinesName$$", this.people.getBusinessName());
            addParameter(params, "$$ContactSeqNumber$$", this.seqNumber);
            addParameter(params, "$$ContactType$$", this.type);
            addParameter(params, "$$Relation$$", this.relation);
            addParameter(params, "$$Phone1$$", this.people.getPhone1());
            addParameter(params, "$$Phone2$$", this.people.getPhone2());
            addParameter(params, "$$Email$$", this.people.getEmail());
            addParameter(params, "$$AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
            addParameter(params, "$$AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
            addParameter(params, "$$City$$", this.people.getCompactAddress().getCity());
            addParameter(params, "$$State$$", this.people.getCompactAddress().getState());
            addParameter(params, "$$Zip$$", this.people.getCompactAddress().getZip());
            addParameter(params, "$$Fax$$", this.people.getFax());
            addParameter(params, "$$Country$$", this.people.getCompactAddress().getCountry());
            addParameter(params, "$$FullName$$", this.people.getFullName());
            return params;
            }
        
        this.replace = function(targetCapId) { // send to another record, optional new contact type
        
            var newType = this.type;
            if (arguments.length == 2) newType = arguments[1];
            //2. Get people with target CAPID.
            var targetPeoples = getContactObjs(targetCapId,[String(newType)]);
            //3. Check to see which people is matched in both source and target.
            for (var loopk in targetPeoples)  {
                var targetContact = targetPeoples[loopk];
                if (this.equals(targetPeoples[loopk])) {
                    targetContact.people.setContactType(newType);
                    aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                    targetContact.people.setContactAddressList(this.people.getContactAddressList());
                    overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                    if (overwriteResult.getSuccess())
                        logDebug("overwrite contact " + targetContact + " with " + this);
                    else
                        logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                    return true;
                    }
                }

                var tmpCapId = this.capContact.getCapID();
                var tmpType = this.type;
                this.people.setContactType(newType);
                this.capContact.setCapID(targetCapId);
                createResult = aa.people.createCapContactWithAttribute(this.capContact);
                if (createResult.getSuccess())
                    logDebug("(contactObj) contact created : " + this);
                else
                    logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
                this.capContact.setCapID(tmpCapId);
                this.type = tmpType;
                return true;
        }

        this.equals = function(t) {
            if (t == null) return false;
            if (!String(this.people.type).equals(String(t.people.type))) { return false; }
            if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
            if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
            if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
            return  true;
        }
        
        this.saveBase = function() {
            // set the values we store outside of the models.
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContact(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) base contact saved : " + this);
            else
                logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
            }               
        
        this.save = function() {
            // set the values we store outside of the models
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContactWithAttribute(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) contact saved : " + this);
            else
                logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
            }

        this.remove = function() {
            var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber)
            if (removeResult.getSuccess())
                logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
            else
                logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
            }

        this.createPublicUser = function() {

            if (!this.capContact.getEmail())
            { logDebug("(contactObj) Couldn't create public user for : " + this +  ", no email address"); return false; }

            if (String(this.people.getContactTypeFlag()).equals("organization"))
            { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }
            
            // check to see if public user exists already based on email address
            var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail())
            if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                userModel = getUserResult.getOutput();
                logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
            }

            if (!userModel) // create one
                {
                logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail()); 
                var publicUser = aa.publicUser.getPublicUserModel();
                publicUser.setFirstName(this.capContact.getFirstName());
                publicUser.setLastName(this.capContact.getLastName());
                publicUser.setEmail(this.capContact.getEmail());
                publicUser.setUserID(this.capContact.getEmail());
                publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                publicUser.setAuditID("PublicUser");
                publicUser.setAuditStatus("A");
                publicUser.setCellPhone(this.people.getPhone2());

                var result = aa.publicUser.createPublicUser(publicUser);
                if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(),userSeqNum,"ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendActivateEmail(userModel, true, true);

                // send another email
                aa.publicUser.sendPasswordEmail(userModel);
                }
                else {
                    logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }
            }

        //  Now that we have a public user let's connect to the reference contact       
            
        if (this.refSeqNumber)
            {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
            }
            

        return userModel; // send back the new or existing public user
        }

        this.getCaps = function() { // option record type filter

        
            if (this.refSeqNumber) {
                aa.print("ref seq : " + this.refSeqNumber);
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        resultArray.push(thisCapId)
                        }
                    }
            }
            
        return resultArray;
        }
    }

/*------------------------------------------------------------------------------------------------------/
|  ContactObj (END)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Update contacts on parent cap. (Start) 
/------------------------------------------------------------------------------------------------------*/

//this is for renewal caps
function updateLicsfromRenewal() {

    var appGroup = "Licenses";
    var appType = "";
    var appSubtype = "";
    var appCategory = "License";

    //get parent license
    var pCapID = getMatchingParent(appGroup, appType, appSubtype, appCategory);

    //aa.print("getMatchingParent:" + getMatchingParent(appGroup, appType, appSubtype, appCategory).getCustomID());

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var con = Contacts[yy];
            //delete the matching contact type on parent and copy contact from renewal/amendment
            copyContacts2Parent(capId, pCapID, con.getCapContactModel().getPeople().getContactType());
        }
    }


}

function getMatchingParent(appGroup, appType, appSubtype, appCategory) {
    // returns the given type capId of parent cap
    var i = 1;
    while (true) {
        if (!(aa.cap.getProjectParents(capId, i).getSuccess()))
            break;

        i += 1;
    }
    i -= 1;

    aa.print("i:" + i);
    getCapResult = aa.cap.getProjectParents(capId, i);
    myArray = new Array();

    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();

        if (parentArray.length) {
            for (x in parentArray) {
                //get the app type
                matchCap = aa.cap.getCap(parentArray[x].getCapID()).getOutput();
                matchArray = matchCap.getCapType().toString().split("/");

                if (appGroup != "") {
                    strIfCond = matchArray[0].equals(appGroup);
                    aa.print("strIfCond1:" + strIfCond);
                }
                if (appType != "") {
                    if (!strIfCond == "") {
                        strIfCond += "&&";
                    }
                    strIfCond += matchArray[1].equals(appType);
                    aa.print("strIfCond2:" + strIfCond);
                }
                if (appSubtype != "") {
                    if (!strIfCond == "") {
                        strIfCond += "&&";
                    }
                    strIfCond += matchArray[2].equals(appSubtype);
                    aa.print("strIfCond3:" + strIfCond);
                }
                if (appCategory != "") {
                    if (!strIfCond == "") {
                        strIfCond += "&&";
                    }
                    strIfCond += matchArray[3].equals(appCategory);
                    aa.print("strIfCond4:" + strIfCond);
                }

                aa.print("strIfCond:" + strIfCond.toString());

                //If parent type matches appType return capid
                if (strIfCond) {
                    aa.print("parentArray[x].getCapID()" + parentArray[x].getCapID());
                    return parentArray[x].getCapID();
                }

            }

            return null;
        }
        else {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return null;
        }
    }
    else {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return null;
    }
}

function copyContacts2Parent(pFromCapId, pToCapId, contType) {
    //Copies all contacts from pFromCapId to pToCapId
    //
    // like original but delete all existing contacts before copy
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;
    //FA 12-20-2010 Dont remove any contacts


    var capContactResult = aa.people.getCapContactByCapID(pToCapId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var con = Contacts[yy];
            if (con.getCapContactModel().getPeople().getContactType().equals(contType)) {
                aa.print("Contact Type=" + con.getCapContactModel().getPeople().getContactType());
                var capContactId = con.getPeople().getContactSeqNumber();
                delResult = aa.people.removeCapContact(pToCapId, capContactId);
                if (!delResult.getSuccess()) {
                    aa.print("Error removing contacts on target Cap " + delResult.getErrorMessage());
                }
            }
        }
    }


    var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var newContact = Contacts[yy].getCapContactModel();
            // Copy only the Application Contanct
            if (Contacts[yy].getCapContactModel().getPeople().getContactType().equals(contType)) {
                newContact.setCapID(vToCapId);
                //aa.people.createCapContact(newContact);
                aa.people.createCapContactWithAttribute(newContact);
                copied++;
                aa.print("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
            }
        }
    }
    else {
        logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
        return false;
    }
    return copied;
}

/*------------------------------------------------------------------------------------------------------/
|  Update contacts on parent cap. (End) 
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Add "Add product" as a child to "Product" cap under license . (Start) 
/------------------------------------------------------------------------------------------------------*/

function addProductToLicsAsChild() {
    var capType = "Licenses/Plant/Soil or Plant Inoculant/Product";
    var appGroup = "Licenses";
    var appType = "";
    var appSubtype = "";
    var appCategory = "License";

    var arrProdCaps = getChildren(capType, capId);

    for (itemCap in arrProdCaps) {
        var childId = arrProdCaps[itemCap];

        aa.print("arrProdCaps:" + childId.getCustomID());

        var thisCap = aa.cap.getCap(childId).getOutput();
        var thisCapStatus = thisCap.getCapStatus();

        aa.print("thisCapStatus:" + thisCapStatus);

        if (thisCapStatus != null) {
            aa.print("thisCapStatus:" + thisCapStatus);

            if (thisCapStatus != "Approved") {
                continue;
            }

            //get parent license
            var pLicsCap = getMatchingParent(appGroup, appType, appSubtype, appCategory);

            aa.print("pLicsCap:" + pLicsCap.getCustomID());

            var result = aa.cap.createAppHierarchy(pLicsCap, childId);
            if (result.getSuccess()) {
                aa.print("Link2Caps-Child application successfully linked");
            } else {
                aa.print("Link2Caps-Could not link applications");
            }

        }
    }

}

/*------------------------------------------------------------------------------------------------------/
|  Add "Add product" as a child to "Product" cap under license . (End) 
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|   Add Reference Contact Standard Condition from Hotfix 1 (Start) RF
/------------------------------------------------------------------------------------------------------*/

function addStdCondition(cType, cDesc) {

    if (!aa.capCondition.getStandardConditions) {
        logDebug("addStdCondition function is not available in this version of Accela Automation.");
    }
    else {
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        for (i = 0; i < standardConditions.length; i++) {
            standardCondition = standardConditions[i];
            if (standardCondition.getConditionType().toUpperCase() == cType.toUpperCase() && standardCondition.getConditionDesc().toUpperCase() == cDesc.toUpperCase()) {
                var addCapCondResult = aa.capCondition.createCapConditionFromStdCondition(capId, standardCondition);

                if (addCapCondResult.getSuccess()) {
                    logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
                }
                else {
                    logDebug("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
                }
            }
        } //EMSE Dom function does like search, needed for exact match
    }
}

function addContactStdCondition(contSeqNum, cType, cDesc) {

    var foundCondition = false;
    var javascriptDate = new Date()
    var javautilDate = aa.date.transToJavaUtilDate(javascriptDate.getTime());


    cStatus = "Applied";
    if (arguments.length > 3)
        cStatus = arguments[3]; // use condition status in args

    if (!aa.capCondition.getStandardConditions) {
        logDebug("addAddressStdCondition function is not available in this version of Accela Automation.");
    }
    else {
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        for (i = 0; i < standardConditions.length; i++)
            if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
            {
                standardCondition = standardConditions[i]; // add the last one found

                foundCondition = true;

                if (!contSeqNum) // add to all reference address on the current capId
                {
                    var capContactResult = aa.people.getCapContactByCapID(capId);
                    if (capContactResult.getSuccess()) {
                        var Contacts = capContactResult.getOutput();
                        for (var contactIdx in Contacts) {
                            var contactNbr = Contacts[contactIdx].getCapContactModel().getRefContactNumber();
                            if (contactNbr) {
                                var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
                                newCondition.setServiceProviderCode(aa.getServiceProviderCode());
                                newCondition.setEntityType("CONTACT");
                                newCondition.setEntityID(contactNbr);
                                newCondition.setConditionDescription(standardCondition.getConditionDesc());
                                newCondition.setConditionGroup(standardCondition.getConditionGroup());
                                newCondition.setConditionType(standardCondition.getConditionType());
                                newCondition.setConditionComment(standardCondition.getConditionComment());
                                newCondition.setImpactCode(standardCondition.getImpactCode());
                                newCondition.setConditionStatus(cStatus);
                                newCondition.setAuditStatus("A");
                                newCondition.setIssuedByUser(systemUserObj);
                                newCondition.setIssuedDate(javautilDate);
                                newCondition.setEffectDate(javautilDate);
                                newCondition.setAuditID(currentUserID);
                                var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);

                                if (addContactConditionResult.getSuccess()) {
                                    logDebug("Successfully added reference contact (" + contactNbr + ") condition: " + cDesc);
                                }
                                else {
                                    logDebug("**ERROR: adding reference contact (" + contactNbr + ") condition: " + addContactConditionResult.getErrorMessage());
                                }
                            }
                        }
                    }
                }
                else {
                    var newCondition = aa.commonCondition.getNewCommonConditionModel().getOutput();
                    newCondition.setServiceProviderCode(aa.getServiceProviderCode());
                    newCondition.setEntityType("CONTACT");
                    newCondition.setEntityID(contSeqNum);
                    newCondition.setConditionDescription(standardCondition.getConditionDesc());
                    newCondition.setConditionGroup(standardCondition.getConditionGroup());
                    newCondition.setConditionType(standardCondition.getConditionType());
                    newCondition.setConditionComment(standardCondition.getConditionComment());
                    newCondition.setImpactCode(standardCondition.getImpactCode());
                    newCondition.setConditionStatus(cStatus);
                    newCondition.setAuditStatus("A");

                    newCondition.setIssuedByUser(systemUserObj);
                    newCondition.setIssuedDate(javautilDate);
                    newCondition.setEffectDate(javautilDate);

                    newCondition.setAuditID(currentUserID);
                    var addContactConditionResult = aa.commonCondition.addCommonCondition(newCondition);

                    if (addContactConditionResult.getSuccess()) {
                        logDebug("Successfully added reference contact (" + contSeqNum + ") condition: " + cDesc);
                    }
                    else {
                        logDebug("**ERROR: adding reference contact (" + contSeqNum + ") condition: " + addContactConditionResult.getErrorMessage());
                    }
                }
            }
    }
    if (!foundCondition) logDebug("**WARNING: couldn't find standard condition for " + cType + " / " + cDesc);
}

/*------------------------------------------------------------------------------------------------------/
|   Add Reference Contact Standard Condition from Hotfix 1 (End) RF
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| ContactObj
/------------------------------------------------------------------------------------------------------*/

function getContactObj(itemCap, typeToLoad) {
    // returning the first match on contact type
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel") { // page flow script 
        var capContactArray = cap.getContactsGroup().toArray();
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
        }
    }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (capContactArray[yy].getPeople().contactType.toUpperCase().equals(typeToLoad.toUpperCase())) {
                logDebug("getContactObj returned the first contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
                return new contactObj(capContactArray[yy]);
            }
        }
    }

    logDebug("getContactObj could not find a contact of type " + typeToLoad + " on record " + itemCap.getCustomID());
    return false;

}

function getContactObjs(itemCap) // optional typeToLoad, optional return only one instead of Array?
{
    var typesToLoad = false;
    if (arguments.length == 2) typesToLoad = arguments[1];
    var capContactArray = null;
    var cArray = new Array();

    if (itemCap.getClass() == "com.accela.aa.aamain.cap.CapModel") { // page flow script 
        var capContactArray = cap.getContactsGroup().toArray();
    }
    else {
        var capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
        }
    }

    if (capContactArray) {
        for (var yy in capContactArray) {
            if (!typesToLoad || exists(capContactArray[yy].getPeople().contactType, typesToLoad)) {
                cArray.push(new contactObj(capContactArray[yy]));
            }
        }
    }

    logDebug("getContactObj returned " + cArray.length + " contactObj(s)");
    return cArray;

}

function contactObj(ccsm) {

    this.people = null; 		// for access to the underlying data
    this.capContact = null; 	// for access to the underlying data
    this.capContactScript = null; // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses

    this.capContactScript = ccsm;
    if (ccsm) {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
        }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();
        }

        this.asiObj = this.people.getAttributes().toArray();
        for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1].attributeValue;
        this.primary = this.capContact.getPrimaryFlag() == "Y";
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
        }
    }
    this.toString = function () { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary; }

    this.getEmailTemplateParams = function (params) {
        addParameter(params, "$$LastName$$", this.people.getLastName());
        addParameter(params, "$$FirstName$$", this.people.getFirstName());
        addParameter(params, "$$MiddleName$$", this.people.getMiddleName());
        addParameter(params, "$$BusinesName$$", this.people.getBusinessName());
        addParameter(params, "$$ContactSeqNumber$$", this.seqNumber);
        addParameter(params, "$$ContactType$$", this.type);
        addParameter(params, "$$Relation$$", this.relation);
        addParameter(params, "$$Phone1$$", this.people.getPhone1());
        addParameter(params, "$$Phone2$$", this.people.getPhone2());
        addParameter(params, "$$Email$$", this.people.getEmail());
        addParameter(params, "$$AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
        addParameter(params, "$$AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
        addParameter(params, "$$City$$", this.people.getCompactAddress().getCity());
        addParameter(params, "$$State$$", this.people.getCompactAddress().getState());
        addParameter(params, "$$Zip$$", this.people.getCompactAddress().getZip());
        addParameter(params, "$$Fax$$", this.people.getFax());
        addParameter(params, "$$Country$$", this.people.getCompactAddress().getCountry());
        addParameter(params, "$$FullName$$", this.people.getFullName());
        return params;
    }

    this.replace = function (targetCapId) { // send to another record, optional new contact type

        var newType = this.type;
        if (arguments.length == 2) newType = arguments[1];
        //2. Get people with target CAPID.
        var targetPeoples = getContactObjs(targetCapId, [String(newType)]);
        //3. Check to see which people is matched in both source and target.
        for (var loopk in targetPeoples) {
            var targetContact = targetPeoples[loopk];
            if (this.equals(targetPeoples[loopk])) {
                targetContact.people.setContactType(newType);
                aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                targetContact.people.setContactAddressList(this.people.getContactAddressList());
                overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                if (overwriteResult.getSuccess())
                    logDebug("overwrite contact " + targetContact + " with " + this);
                else
                    logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                return true;
            }
        }

        var tmpCapId = this.capContact.getCapID();
        var tmpType = this.type;
        this.people.setContactType(newType);
        this.capContact.setCapID(targetCapId);
        createResult = aa.people.createCapContactWithAttribute(this.capContact);
        if (createResult.getSuccess())
            logDebug("(contactObj) contact created : " + this);
        else
            logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
        this.capContact.setCapID(tmpCapId);
        this.type = tmpType;
        return true;
    }

    this.equals = function (t) {
        if (t == null) return false;
        if (!String(this.people.type).equals(String(t.people.type))) { return false; }
        if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
        if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
        if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
        return true;
    }

    this.saveBase = function () {
        // set the values we store outside of the models.
        this.people.setContactType(this.type);
        this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
        this.people.setRelation(this.relation);
        saveResult = aa.people.editCapContact(this.capContact);
        if (saveResult.getSuccess())
            logDebug("(contactObj) base contact saved : " + this);
        else
            logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
    }

    this.save = function () {
        // set the values we store outside of the models
        this.people.setContactType(this.type);
        this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
        this.people.setRelation(this.relation);
        saveResult = aa.people.editCapContactWithAttribute(this.capContact);
        if (saveResult.getSuccess())
            logDebug("(contactObj) contact saved : " + this);
        else
            logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
    }

    this.remove = function () {
        var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber);
        if (removeResult.getSuccess())
            logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
        else
            logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
    }

    this.createPublicUser = function () {

        if (!this.capContact.getEmail())
        { logDebug("(contactObj) Couldn't create public user for : " + this + ", no email address"); return false; }

        if (String(this.people.getContactTypeFlag()).equals("organization"))
        { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }

        // check to see if public user exists already based on email address
        var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail());
        if (getUserResult.getSuccess() && getUserResult.getOutput()) {
            userModel = getUserResult.getOutput();
            logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
        }

        if (!userModel) // create one
        {
            logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail());
            var publicUser = aa.publicUser.getPublicUserModel();
            publicUser.setFirstName(this.capContact.getFirstName());
            publicUser.setLastName(this.capContact.getLastName());
            publicUser.setEmail(this.capContact.getEmail());
            publicUser.setUserID(this.capContact.getEmail());
            publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
            publicUser.setAuditID("PublicUser");
            publicUser.setAuditStatus("A");
            publicUser.setCellPhone(this.people.getPhone2());

            var result = aa.publicUser.createPublicUser(publicUser);
            if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput();

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput();
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(), userSeqNum, "ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendActivateEmail(userModel, true, true);

                // send another email
                aa.publicUser.sendPasswordEmail(userModel);
            }
            else {
                logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
            }
        }

        //  Now that we have a public user let's connect to the reference contact		

        if (this.refSeqNumber) {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
        }


        return userModel; // send back the new or existing public user
    }

    this.getCaps = function () { // option record type filter


        if (this.refSeqNumber) {
            aa.print("ref seq : " + this.refSeqNumber);
            var capTypes = null;
            var resultArray = new Array();
            if (arguments.length == 1) capTypes = arguments[0];

            var pm = aa.people.createPeopleModel().getOutput().getPeopleModel();
            var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput();
            pm.setServiceProviderCode(aa.getServiceProviderCode());
            pm.setContactSeqNumber(this.refSeqNumber);

            var cList = ccb.getCapContactsByRefContactModel(pm).toArray();

            for (var j in cList) {
                var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(), cList[j].getCapID().getID2(), cList[j].getCapID().getID3()).getOutput();
                if (capTypes && appMatch(capTypes, thisCapId)) {
                    resultArray.push(thisCapId);
                }
            }
        }

        return resultArray;
    }

    this.createRefLicProf = function (licNum, rlpType, addressType, licenseState) {

        // optional 3rd parameter serv_prov_code
        var updating = false;
        var serv_prov_code_4_lp = aa.getServiceProviderCode();
        if (arguments.length == 5) {
            serv_prov_code_4_lp = arguments[4];
            aa.setDelegateAgencyCode(serv_prov_code_4_lp);
        }

        // addressType = one of the contact address types, or null to pull from the standard contact fields.
        var newLic = getRefLicenseProf(licNum);

        if (newLic) {
            updating = true;
            logDebug("(contactObj) Updating existing Ref Lic Prof : " + licNum);
        }
        else {
            var newLic = aa.licenseScript.createLicenseScriptModel();
        }

        peop = this.people;
        cont = this.capContact;
        newLic.setContactFirstName(cont.getFirstName());
        newLic.setContactMiddleName(peop.getMiddleName()); // use people for this
        newLic.setContactLastName(cont.getLastName());
        newLic.setBusinessName(peop.getBusinessName());
        newLic.setPhone1(peop.getPhone1());
        newLic.setPhone2(peop.getPhone2());
        newLic.setEMailAddress(peop.getEmail());
        newLic.setFax(peop.getFax());
        newLic.setAgencyCode(serv_prov_code_4_lp);
        newLic.setAuditDate(sysDate);
        newLic.setAuditID(currentUserID);
        newLic.setAuditStatus("A");
        newLic.setLicenseType(rlpType);
        newLic.setStateLicense(licNum);
        newLic.setLicState(licenseState);
        addr = peop.getCompactAddress();

        if (addressType) { // pull from contact addresses
            for (var i in this.addresses) {
                cAddr = this.addresses[i];
                aa.print("found address " + cAddr.getAddressType() + " with state " + cAddr.getState());
                if (cAddr.getAddressType().equals(addressType)) {
                    aa.print("...and using it");
                    addr = cAddr;
                }
            }
        }

        newLic.setAddress1(addr.getAddressLine1());
        newLic.setAddress2(addr.getAddressLine2());
        newLic.setAddress3(addr.getAddressLine3());
        newLic.setCity(addr.getCity());
        newLic.setState(addr.getState());
        newLic.setZip(addr.getZip());

        if (updating)
            myResult = aa.licenseScript.editRefLicenseProf(newLic);
        else
            myResult = aa.licenseScript.createRefLicenseProf(newLic);

        if (arguments.length == 5) {
            aa.resetDelegateAgencyCode();
        }

        if (myResult.getSuccess()) {
            logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " From Contact " + this);
            return true;
        }
        else {
            logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
            return false;
        }
    }
}



/*------------------------------------------------------------------------------------------------------/
|  ContactObj (END)
/------------------------------------------------------------------------------------------------------*/

function getParents(pAppType) {
    // returns the capId array of all parent caps
    //Dependency: appMatch function
    //

    parentArray = getRoots(capId);

    myArray = new Array();

    if (parentArray.length > 0) {
        if (parentArray.length) {
            for (x in parentArray) {
                if (pAppType != null) {
                    //If parent type matches apType pattern passed in, add to return array
                    if (appMatch(pAppType, parentArray[x]))
                        myArray.push(parentArray[x]);
                }
                else
                    myArray.push(parentArray[x]);
            }

            return myArray;
        }
        else {
            logDebug("**WARNING: GetParent found no project parent for this application");
            return null;
        }
    }
    else {
        logDebug("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return null;
    }
}

/*------------------------------------------------------------------------------------------------------/
|  getParents replacement functions (End)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
|  Send out a letter to the applicant stating the security amount to be deposited to the applicant (Start)
/------------------------------------------------------------------------------------------------------*/

function sendSecurityCommunicationLetter() {

    var sendEmailToContactType = "Business";
    var FromEmailAddress = "noreply@accela.com";
    var toEmailAddress = "";

    var tmplName = ""; //template name

    var conArray = getContactArray(capId);

    aa.print("Have the contactArray");

    for (thisCon in conArray) {
        toEmailAddress = null;
        b3Contact = conArray[thisCon];
        aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
        if (b3Contact["contactType"] == sendEmailToContactType) {
            toEmailAddress = b3Contact["email"];
            if (toEmailAddress != null) {
                aa.print("toEmailAddress:" + toEmailAddress);
                // var params = aa.util.newHashtable();
                // getRecordParams4SecurityCommNotification(params);

                //send email
                //sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);

                //temp email send method remove this once you get the template for this script
                email(toEmailAddress, FromEmailAddress, "the security amount to be deposited to the applicant", "the security amount to be deposited to the applicant");
            }
        }
    }

}

function getRecordParams4SecurityCommNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    var thisArr = new Array();
    var tsiVal = "";

    addParameter(params, "$$REPLACE THIS WITH ACTUAL PARAM IN EMAIL TEMPLATE$$", tsiVal);

    return params;
}

/*------------------------------------------------------------------------------------------------------/
|  Send out a letter to the applicant stating the security amount to be deposited to the applicant (End)
/------------------------------------------------------------------------------------------------------*/

function createOrUpdateEstablishments() {
	var addArray = false;
	var estArray = false;
	var estId = false;
	var theContactObj = getContactObj(capId,"Business");
	if (!theContactObj) { 
		logDebug("no business contact to use for establishment");
		return false;
		}

	logDebug("using contact for establishment : " + theContactObj);
	
	var estArray = getCapsByContAndAddress(theContactObj,"Physical Address");

	if (estArray) {
		for (var i in estArray) 
			if (appMatch("Licenses/Establishment/NA/NA",estArray[i].getCapID())) 
				estId = estArray[i].getCapID();
		}

	logDebug("existing establishment : " + estId);
	
	var thisEst = doEstablishmentCreation(estId,theContactObj);

	if (appMatch("Licenses/Plant/Nursery Grower/Application") || appMatch("Licenses/Plant/Nursery Dealer/Application")) {
		var addArray = getContactObjs(capId, ["Additional Location"]);
		}
		
	if (appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application")) {
		var addArray = getContactObjs(capId, ["Facility Location"]);
		}
		
	if (addArray) {
		for (var i in addArray) {
			estId = false;
			theContactObj = addArray[i];
			logDebug("Additional Location Establishment : " + theContactObj);
			estArray = getCapsByContAndAddress(theContactObj,"Physical Address");
			for (var j in estArray) {
				if (appMatch("Licenses/Establishment/NA/NA",estArray[j].getCapID())) {
					estId = estArray[j].getCapID();
					logDebug("Existing Branch Establishment : " + estId);
					}
				branchEst = doEstablishmentCreation(estId,theContactObj);
				if (branchEst) {
					var capContacts = aa.people.getCapContactByCapID(branchEst).getOutput();
					for (var yy in capContacts) { aa.people.removeCapContact(branchEst, capContacts[yy].getPeople().getContactSeqNumber()); }
					theContactObj.replace(branchEst,"Business");
					}
				
				if (thisEst && branchEst) addParent(thisEst.getCustomID(),branchEst);
				
				}
			}
		}
	}
	
	
function doEstablishmentCreation(estId,theContactObj,theBizContact) {
	
	if (!estId) {
		estId = createParent("Licenses","Establishment","NA","NA","");
		logDebug("Created Establishment Record " + estId.getCustomID());
		copyContactAddressToAddress(theContactObj,"Physical Address","Physical Address",true,capId,estId );
	}

	if (estId) {
		editAppSpecific("Site Type",AInfo["Site Type"],estId );
		editAppSpecific("Operation Type",AInfo["Operation Type"],estId );
		editAppSpecific("Nursery Size",AInfo["Nursery Size"],estId );
		editAppSpecific("Greenhouse Size",AInfo["Greenhouse Size"],estId );
		editAppSpecific("Acreage",AInfo["Production Acreage"],estId );
		editAppSpecific("Sq. Ft of Glass",AInfo["SqFt of Glass/Plastic"],estId );
		editAppSpecific("Operation Type",AInfo["Dealer Operation Type"],estId );
	} else {
		logDebug("WARNING! Establishment not created");
	}

	if (estId && appMatch("Licenses/Plant/Nursery Grower/*")) {
		copyContactAddressToAddress(theContactObj,"Mailing","Plant Inspection Mailing",false,capId,estId );
		}
		
	return estId;
}	

 function isEmpty(str) {
    return (!str || 0 === str.length);
}

 function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

 function getRoots(nodeId)
{
	var rootsArray = new Array();
	var directParentsResult = aa.cap.getProjectByChildCapID(nodeId,'R',null);
	
    if (directParentsResult.getSuccess())
    {
		tmpdirectParents = directParentsResult.getOutput();
		for(ff in tmpdirectParents) {
			if (tmpdirectParents[ff]) {
				
				var tmpNode = getRootNode(tmpdirectParents[ff].getProjectID(), 1);
				var id1 = tmpNode.getID1();
				var id2 = tmpNode.getID2();
				var id3 = tmpNode.getID3();
				var pCapId = aa.cap.getCapID(id1,id2,id3).getOutput();
				rootsArray.push(pCapId);
			}
		}
    }
	return rootsArray;
}

 function isSameNode(node1, node2)
{
	if (node1 == null || node1 == undefined || node2 == null || node2 == undefined)
	{
		return false;
	}
	return node1.getID1() == node2.getID1() && node1.getID2() == node2.getID2() && node1.getID3() == node2.getID3();
}

 function getRootNode(nodeId, depth)
{
	if (depth > 9)
	{
		return nodeId;
	}
	var depthCount = depth + 1;
	var currentNode = nodeId;
	var directParentsResult = aa.cap.getProjectByChildCapID(currentNode,'R',null);
    if (directParentsResult.getSuccess())
    {
		directParents = directParentsResult.getOutput();
		for(var ff in directParents) {
			
			if (directParents[ff])
			{
				
				var id1 = directParents[ff].getProjectID().getID1();
				var id2 = directParents[ff].getProjectID().getID2();
				var id3 = directParents[ff].getProjectID().getID3();				
				
				while (!isSameNode(currentNode,directParents[ff].getProjectID()))
				{
					currentNode = getRootNode(directParents[ff].getProjectID(), depthCount);					
				}
			}			
		}
    }
	return currentNode;

}

/*------------------------------------------------------------------------------------------------------/
|  Set the Expiration Date for Milk Dealer Applications. Last update: 5/24/2013
/------------------------------------------------------------------------------------------------------*/

function setExpirationDateForMlk(ID)
{
       logDebug("Inside setExpirationDate");
       //logDebug("Cap ID: " +ID);
       var pcapId=ID;
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
       logDebug("Parent ID: " + pcapId);
       //var recID=aa.cap.getCapID(ID).getOutput();
              
       var currentDate=new Date(Date.parse(sysDateMMDDYYYY));
       
       var year=currentDate.getFullYear() + 1;
       var month=currentDate.getMonth();
       var expirationDate=new Date();

       expirationDate.setFullYear(year);
       expirationDate.setMonth(month);
       expirationDate.setDate(0); 

       var expDateString= expirationDate.getMonth() + 1+ "/" + expirationDate.getDate() + "/" + expirationDate.getFullYear();

       thisLic=new licenseObject(licNum,pcapId);
       thisLic.setExpiration(expDateString);
         
       b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                   //b1Exp.setExpDate(sysDateMMDDYYYY);
                   //expResult = aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                   //logDebug(expResult.getSuccess());
                   var expDate=b1Exp.getExpDate();
                   if(expDate)
                   {
                       var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                       logDebug("Updated Expiration Date: " + b1ExpDate);
                   }
                } 
           }
}

/*------------------------------------------------------------------------------------------------------/
|  Set the Expiration Date for Milk Dealer Renewals. Last update: 6/25/2013
/------------------------------------------------------------------------------------------------------*/

function setExpirationDateForMlkRenewal(ID)
{
       logDebug("Inside setExpirationDateRenewal");
       var pcapId=ID;
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
       logDebug("Parent ID: " + pcapId);
       
       b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                   var expDate=b1Exp.getExpDate();
                   if(expDate)
                   {
                       var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                       b1ExpDate=Date.parse(b1ExpDate);
                       var newDate=new Date(b1ExpDate);
                       var month=newDate.getMonth();
                       var day=newDate.getDate();
                       var year=parseInt(newDate.getFullYear()) + 1;
                       newDate.setMonth(month);
                       newDate.setDate(day);
                       newDate.setFullYear(year);
                       var dateString= newDate.getMonth()+1 + "/" + newDate.getDate() + "/" + newDate.getFullYear();
                       logDebug("Updated expiration date: " + dateString);

                       thisLic=new licenseObject(licNum,pcapId);
                       thisLic.setExpiration(dateString);
                    }
                } 
           }

       b2ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b2ExpResult.getSuccess())
       {
               var b2Exp = b2ExpResult.getOutput();
               if(b2Exp)
               {
                   var expDate1=b2Exp.getExpDate();
                   if(expDate1)
                   {
                       var b2ExpDate = expDate1.getMonth() + "/" + expDate1.getDayOfMonth() + "/" + expDate1.getYear();
                       logDebug("Updated Expiration Date: " + b2ExpDate);
                   }
                } 
           }

}


/*------------------------------------------------------------------------------------------------------/
|  Set the Expiration Date for Farm Products Dealer Applications and Renewals. Last update: 5/24/2013
/------------------------------------------------------------------------------------------------------*/

function setExpirationDateForFarm(ID)
{
       logDebug("Inside setExpirationDate");
       var pcapId= ID
       logDebug("Parent ID: " + pcapId);
       var licNum=pcapId.getCustomID();
       logDebug("Custom ID: " + licNum);
       logDebug("Parent ID: " + pcapId);

       var currentDate=new Date(Date.parse(sysDateMMDDYYYY));
       
       var year=currentDate.getFullYear() + 1;

       var expirationDate=new Date();

       expirationDate.setFullYear(year);
       expirationDate.setMonth(3);
       expirationDate.setDate(30); 

       var expDateString= expirationDate.getMonth() + 1+ "/" + expirationDate.getDate() + "/" + expirationDate.getFullYear();

       thisLic=new licenseObject(licNum,pcapId);
       thisLic.setExpiration(expDateString);

       b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                   var expDate=b1Exp.getExpDate();
                   if(expDate)
                   {
                       var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                       logDebug("Updated Expiration Date: " + b1ExpDate);
                   }
                } 
           }
 }

/*------------------------------------------------------------------------------------------------------/
|   Create set. Last update: 6/18/2013
/------------------------------------------------------------------------------------------------------*/
function createSet(setName,setDescription,setType,setStatus,setStatusComment) {

    //optional 3rd parameter is setType
    //optional 4th parameter is setStatus
    //optional 5th paramater is setStatusComment


    //var setType = "";
    //var setStatus = "";
    //var setStatusComment = "";


    /* if (arguments.length > 2) {
        setType = arguments[2]
    }


    if (arguments.length > 3) {
        setStatus = arguments[3]
    }


    if (arguments.length > 4) {
        setStatusComment = arguments[4];
    } */

    //logDebug("Inside create set");

    var setScript = aa.set.getSetHeaderScriptModel().getOutput();
    setScript.setSetID(setName);
    setScript.setSetTitle(setDescription);
    setScript.setSetComment(setStatusComment);
    setScript.setSetStatus(setStatus);
    setScript.setRecordSetType(setType);
    setScript.setServiceProviderCode(aa.getServiceProviderCode());
    setScript.setAuditDate(aa.date.getCurrentDate());
    setScript.setAuditID(currentUserID);


    var setCreateResult = aa.set.createSetHeader(setScript);
    //logDebug("Result: " + setCreateResult.getSuccess());
   
    return setCreateResult.getSuccess();
} 

/*------------------------------------------------------------------------------------------------------/
|   capSet object. Last update: 6/20/2013
/------------------------------------------------------------------------------------------------------*/

function capSet(desiredSetId)
    {
    this.refresh = function()
        {

        var theSet = aa.set.getSetByPK(this.id).getOutput();
		this.status = theSet.getSetStatus();
        this.setId = theSet.getSetID();
        this.name = theSet.getSetTitle();
        this.comment = theSet.getSetComment();
		this.model = theSet.getSetHeaderModel();
		this.statusComemnt = theSet.getSetStatusComment();

        var memberResult = aa.set.getCAPSetMembersByPK(this.id);

        if (!memberResult.getSuccess()) { logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage()); }
        else
            {
            this.members = memberResult.getOutput().toArray();
            this.size = this.members.length;
            if (this.members.length > 0) this.empty = false;
            logDebug("capSet: loaded set " + this.id + " of status " + this.status + " with " + this.size + " records");
            }
        }
        
    this.add = function(addCapId) 
        {
        var setMemberStatus;
        if (arguments.length == 2)  setMemberStatus = arguments[1]; 
            
        var addResult = aa.set.add(this.id,addCapId)
        
        // Update a SetMember Status for a Record in SetMember List.

        var setUpdateScript = aa.set.getSetDetailsScriptModel().getOutput();
        setUpdateScript.setSetID(this.id);          //Set ID
        setUpdateScript.setID1(addCapId.getID1());
        setUpdateScript.setID2(addCapId.getID2());
        setUpdateScript.setID3(addCapId.getID3());
        if (setMemberStatus) {
            setUpdateScript.setSetMemberStatus(setMemberStatus); 
            setUpdateScript.setSetMemberStatusDate(aa.date.getCurrentDate());  
            }
        setUpdateScript.setServiceProviderCode(aa.getServiceProviderCode());

        var addResult = aa.set.updateSetMemberStatus(setUpdateScript);
        
        if (!addResult.getSuccess()) 
            { 
            logDebug("**WARNING** error adding record to set " + this.id + " : " + addResult.getErrorMessage() );
            }
        else 
            { 
            logDebug("capSet: added record " + addCapId + " to set " + this.id);
            }
        }
    
    this.remove = function(removeCapId) 
        {
        var removeResult = aa.set.removeSetHeadersListByCap(this.id,removeCapId)
        if (!removeResult.getSuccess()) 
            { 
            logDebug("**WARNING** error removing record from set " + this.id + " : " + removeResult.getErrorMessage() );
            }
        else 
            { 
            logDebug("capSet: removed record " + removeCapId + " from set " + this.id);
            }
        }
    
    this.update = function() 
        {
		var sh = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.SetBusiness").getOutput();
		this.model.setSetStatus(this.status)
        this.model.setSetID(this.setId);
        this.model.setSetTitle(this.name);
		this.model.setSetComment(this.comment);
		this.model.setSetStatusComment(this.statusComment);
		
		logDebug("capSet: updating set header information");
		try {
			updateResult = sh.updateSetBySetID(this.model);
			}
		catch(err) {
            logDebug("**WARNING** error updating set header failed " + err.message);
            }

        }
    
    this.id = desiredSetId;
    this.name = desiredSetId;
    if (arguments.length > 1 && arguments[1]) this.name = arguments[1];
    
    this.comment = null;
    
    this.size = 0;
    this.empty = true;
    this.members = new Array();
    this.status = "";
	this.statusComment = "";
	this.model = null;
    var theSetResult = aa.set.getSetByPK(this.id);
    
    if (theSetResult.getSuccess())
        {
        this.refresh();
        }
        
    else  // add the set
        {
        theSetResult = aa.set.createSet(this.id,this.name);
        if (!theSetResult.getSuccess()) 
            {
            logDebug("**WARNING** error creating set " + this.id + " : " + theSetResult.getErrorMessage);
            }
        else
            {
            logDebug("capSet: Created new set " + this.id); 
            this.refresh();
            }
        }
    }


/*------------------------------------------------------------------------------------------------------/
|  Add license to set in order to generate certificate. Last update: 6/25/2013
/------------------------------------------------------------------------------------------------------*/
function addLicenseToSet(recordType, parentID)
{
   var tDate=sysDateMMDDYYYY;
   var flag;
   var setIDForCompleted;
   var existingSet;
   var id;

   for(var i=0;;i++)
   {
       	id = recordType + "_" + tDate + "_" + (i+1);
   	logDebug("Set ID: " + id);
   	var setResult=aa.set.getSetByPK(id);
   	if(setResult.getSuccess())
  	{
     		setResult=setResult.getOutput();
     		logDebug("Set Comment: " + setResult.getSetComment());
     		if(setResult.getSetComment()=="Processing") //Set exists, status "Pending"
     		{
         		flag="P";
         		existingSet=setResult;
         		break;
     		}
     		else if(setResult.getSetComment()=="Successfully processed") //Set exists, status "Completed"
     		{
        		setIDForCompleted=setResult.getSetID();
     		}
   	}
   	else  //set does not exist
   	{
       		flag="N";
       		break;
   	}  
    }

    if (flag=="P")
    {
   	//aa.print("Inside if");  
        var custID=parentID.getCustomID();
   	var capID=aa.cap.getCapID(custID).getOutput();
   	var set=aa.set.getSetByPK(existingSet.getSetID());
   	set=set.getOutput();
   	var addResult= aa.set.addCapSetMember((set.getSetID()),capID); 
   	logDebug("Result for set with pending status: " + addResult.getSuccess());
    }
    else if(flag=="N" && !setIDForCompleted)
    {
  	logDebug("Create new set");
  	var result=createSet(id,"NURSERY DEALER - LICENSE CERTIFICATE", "Nursery Dealer - License", "Pending", "Processing");
  	logDebug("createSet Result: " + result);
  	if(result)
  	{
    	   	logDebug("Set created");
     		var setResult=aa.set.getSetByPK(id);
     		if(setResult.getSuccess())
     		{
        		setResult=setResult.getOutput();
                        var cID=parentID.getCustomID();
        		var capID=aa.cap.getCapID(cID).getOutput();
        		var addResult= aa.set.addCapSetMember((setResult.getSetID()),capID); 
        		logDebug("Result for 1st new set: " + addResult.getSuccess());

     		}
  	}
    }
    else if(setIDForCompleted)
    {
     	var tempStr=recordType + "_" + tDate + "_";
     	var setNumber=setIDForCompleted.substr(tempStr.length,setIDForCompleted.length());
     	setNumber= parseInt(setNumber);
     	setNumber=setNumber + 1;
     	var newSetId= recordType + "_" + tDate + "_" + setNumber;
     	logDebug("New Set ID: " + newSetId);
     	var newSetResult=createSet(newSetId,"NURSERY DEALER - LICENSE CERTIFICATE", "Nursery Dealer - License", "Pending", "Processing");
     	if(newSetResult)
     	{
         	var getNewSetResult=aa.set.getSetByPK(newSetId);
         	if(getNewSetResult.getSuccess())
         	{
             		getNewSetResult=getNewSetResult.getOutput();
                        var customID=parentID.getCustomID();
             		var capID=aa.cap.getCapID(customID).getOutput();
             		var addToNewSetResult= aa.set.addCapSetMember((getNewSetResult.getSetID()),capID); 
             		logDebug("Result for new set: " + addToNewSetResult.getSuccess());
         	}
     	}
     }
}


  function updateSetStatus(setName){
 var setTest = new capSet(setName);
 setTest.status = "Completed";  // update the set header status
 setTest.comment = "Successfully processed";   // changed the set comment
setTest.statusComment = "blah"; // change the set status comment
setTest.update();  // commit changes to the set
 }

/*------------------------------------------------------------------------------------------------------/
|  Check if all workflow tasks before task "Final Review" have been closed for Farm Products Dealer Applications and Renewals. Last update: 5/29/2013
/------------------------------------------------------------------------------------------------------*/
function checkBeforeFinalReview(ID) {
       var count=0;
       logDebug("Inside checkBeforeFinalReview");
       logDebug("Cap ID: " +ID);
       //var recID=aa.cap.getCapID(ID).getOutput();
       b1ExpResult = aa.expiration.getLicensesByCapID(ID);

       if (b1ExpResult.getSuccess())
       {
               var b1Exp = b1ExpResult.getOutput();
               if(b1Exp)
               {
                  var workflowResult = aa.workflow.getTasks(ID); 

                  if (workflowResult.getSuccess()) 
                  {
                     logDebug("Inside workflow");  
                     wfObj = workflowResult.getOutput(); 
                   
                     for (i in wfObj) 
                     { 
                       var fTask = wfObj[i].getTaskItem();
                       var stepnumber = fTask.getStepNumber(); 
                       var processID = fTask.getProcessID(); 
                       var desc = fTask.getTaskDescription(); 
                       var disp = fTask.getDisposition(); 
                       logDebug("Step Number:" + stepnumber + " " + "Process ID:" + processID + " " + "Description:" + desc + " " + "Status:" + disp); 
                       if (desc == "Application Intake" && disp =="Received")
                        {
				count++;
                        }
			if (desc == "Application Review" && disp =="Completed")
                        {
				count++;
                        }
			if (desc == "Pre-liminary Security Review" && disp=="Approved")
                        {
				count++;
                        }
			if (desc == "Ag Development Review" && disp=="Approved")
                        {
				count++;
                        }
                        aa.print("Count: " + count);
                     }   
                }
           }
      }
      if (count<4)
      {
           return true;
      }
}

/*------------------------------------------------------------------------------------------------------/
|  Check to see if any new product/brand added. This only applies to Renewals (Start) Last update: 6/20/2013
/------------------------------------------------------------------------------------------------------*/
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
 function getTableName4Cap(strType) {
     aa.print("strType:" + strType);

     if(strType.equals("Agricultural Liming Material")){
        return "LIME BRAND";
     }else if(strType.equals("Soil or Plant Inoculant")){
        return "PRODUCT";
     }else if(strType.equals("Commercial Fertilizer")){
        return "FERTILIZER BRAND/PRODUCT NAMES";
     }else if(strType.equals("Commercial Compost")){
        return "BRAND/PRODUCT LIST";
    } else if (strType.equals("Ammonium Nitrate Fertilizer")) {
        return "PRODUCT / BRAND";
    } else {
        aa.print("Table name not found for " + strType);
        return;
     }
 }

//find if all product info is same
 function isAllProductInfoSame(tableValueArray1, tableValueArray2, capID, tableName) {

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(capID, tableName)

    if (!tssmResult.getSuccess())
    { aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()); return false }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field

    for (thisrow1 in tableValueArray1) {
    var col = tsm.getColumns()
        var coli = col.iterator();

        while (coli.hasNext()) {
            var colname = coli.next();
            val1 = tableValueArray1[thisrow1][colname.getColumnName()].fieldValue;
            val2 = tableValueArray2[thisrow1][colname.getColumnName()].fieldValue;
            val1Len = 0;
            val2Len = 0;

            if (isEmpty(val1) && isBlank(val1)) {
                val1Len = 0;
            } else {
                val1Len = val1.length();
            }
            
            if (isEmpty(val2) && isBlank(val2)){
                val2Len = 0;
            } else {
                val2Len = val2.length();
            }

            aa.print("1" + (isEmpty(val1) && isBlank(val1)));
            aa.print("2" + (isEmpty(val2) && isBlank(val2)));
            aa.print("val1:" + val1Len + " val2:" + val1Len);

            //if count is zero it might be null for both or one continue.
            if (val1Len == 0 && val1Len == 0) continue;

            if (val1==val2) {
                aa.print("EQUAL");
            } else {
                aa.print("NOT EQUAL");
                return false;
            }
        }
    }
    return true;

}

/*------------------------------------------------------------------------------------------------------/
|  Check to see if any new product/brand added. This only applies to Renewals (End) 
/------------------------------------------------------------------------------------------------------*/






