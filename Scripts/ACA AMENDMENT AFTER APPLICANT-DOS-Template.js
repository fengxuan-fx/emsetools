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
var feeRecordTypesToAmend  = ["*/*/*/License","*/*/*/Temporary License"];  // array of record type masks no charge
var noFeeRecordTypesToAmend = ["*/*/*/Application","*/*/*/Renewal","*/*/*/Temporary Renewal"];  // array of record type masks that will be charged
var changeFee = "10";

try {

	var theContact = new contactObj(cap.getApplicantModel());
	if (theContact) {

	for (var i in noFeeRecordTypesToAmend) {
		var relatedContactObjs = theContact.getRelatedContactObjs(noFeeRecordTypesToAmend[i]);
		if (relatedContactObjs) {
			for (var j in relatedContactObjs) {
				addRow(relatedContactObjs[j],0);
				logDebug("Amendment table: added " + relatedContactObjs[j]);
				}
			}
		}

	for (var i in feeRecordTypesToAmend) {
		var relatedContactObjs = theContact.getRelatedContactObjs(feeRecordTypesToAmend[i]);
		if (relatedContactObjs) {
			for (var j in relatedContactObjs) {
				addRow(relatedContactObjs[j],changeFee);
				logDebug("Amendment table: added " + relatedContactObjs[j]);
				}
			}
		}


	asit = cap.getAppSpecificTableGroupModel();
	new_asit = addASITable4ACAPageFlow(asit,"AMEND", licenseTable);
	}
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