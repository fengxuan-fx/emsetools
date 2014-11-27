/*------------------------------------------------------------------------------------------------------/
| Program : ACA NAME AMENDMENT AFTER APPLICANT.js
| Event   : ACA_AfterButton Event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|

/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;						// Set to true to see results in popup window
var showDebug = false;							// Set to true to see debug messages in popup window
var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;			// Use Group name when populating Task Specific Info Values
var cancel = false;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message =	"";							// Message String
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
	useSA = true; 	
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
	}
	
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
	eval(getScriptText(SAScript,SA));
	}
else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	}
	
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName){
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();	
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";	
		} catch(err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID(); 				// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); 			// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); 			// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();

var AInfo = new Array(); 					// Create array for tokenized variables

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

var agencies = new Array();
var licenseTable = new Array();
getContactAmendmentParametersAGM();

try {
	var theContact = new contactObj(cap.getApplicantModel());
	if (theContact) {

	for (var i in noFeeRecordTypesToAmend) {
		var relatedContactObjs = theContact.getRelatedContactObjs(noFeeRecordTypesToAmend[i]);
		if (relatedContactObjs) {
			for (var j in relatedContactObjs) {
				var cCapId = relatedContactObjs[j].capId;
				var cCap = aa.cap.getCap(cCapId).getOutput();
				var cCapStatus = cCap.getCapStatus();
				if (exists(cCapStatus,includedStatusList)) {
					addRow(relatedContactObjs[j],0);
					logDebug("Amendment table: added " + relatedContactObjs[j]);					
				}
			}
		}
	}

	asit = cap.getAppSpecificTableGroupModel();
	new_asit = addASITable4ACAPageFlow(asit,"AMEND", licenseTable);
	
	var addresses = theContact.addresses;
	
	var addrTable = new Array();  

	for (var i in addresses) {
		row = new Array();
		var a = addresses[i];
		var aDesc = "" 
		if (a.getAddressLine1()) aDesc+= a.getAddressLine1();
		if (a.getAddressLine2() && a.getAddressLine2() != "--Select--") aDesc+= " " + a.getAddressLine2();
		if (a.getCity()) aDesc+= " " + a.getCity();
		if (a.getState()) aDesc+= " " + a.getState();
		if (a.getZip()) aDesc+= " " + a.getZip();
		
		row["Address Type"] = new asiTableValObj("Address Type", "" + addresses[i].getAddressType(), "Y");
		row["Address"] = new asiTableValObj("Address", aDesc, "Y");
		row["Address ID"] = new asiTableValObj("Address ID","" + addresses[i].getId(),"Y");
		var changeThisAddress = "No";
		if (addresses.length == 1) changeThisAddress = "Yes";
		row["Change this Address"] = new asiTableValObj("Change this Address", changeThisAddress, "N");
		addrTable.push(row);
		}

	asit = cap.getAppSpecificTableGroupModel();
	ta = asit.getTablesMap().values();
	new_asit = addASITable4ACAPageFlow(asit,"AMEND_ADDRESS", addrTable);
	}
	
	var parentId= cap.getParentCapID();
	editAppSpecific4ACA("License Number",parentId.getCustomID());
	aa.env.setValue("CapModel",cap);	
	
}
catch (err) { logDebug("**ERROR : " + err); }


function addRow(c,theFee) {
	var row = new Array();
	var thisCapId = c.capId;
	var thisCap = aa.cap.getCap(thisCapId).getOutput();
	if (thisCap.isCompleteCap() && thisCap.getAccessByACA != "N") {
		row["Entity ID"] = new asiTableValObj("Entity ID", "" + c.seqNumber, "Y");
		row["Record ID"] = new asiTableValObj("Record ID", "" + thisCapId.getCustomID(), "Y");
		row["Record Description"] = new asiTableValObj("Record Description", "" + thisCap.getCapModel().getAppTypeAlias(), "Y");
		row["Change this Record?"] = new asiTableValObj("Change this Record?", "Y", "N");
		row["Fee"] = new asiTableValObj("Fee", "" + theFee, "Y");
		licenseTable.push(row);
		}
	}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/