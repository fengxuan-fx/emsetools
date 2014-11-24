/*------------------------------------------------------------------------------------------------------/
| Program : ACA_Require_Label_Submitjs
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

var AInfo = new Array();						// Create array for tokenized variables
//loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables4ACA();

var AInfo = new Array(); 					// Create array for tokenized variables

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

showDebug = false;
showList = false;
capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
pId = getParentCapID4Renewal(capId);

if (appMatch("Licenses/Plant/Soil or Plant Inoculant/Product") && submittedDocList.length <=0) {
	showMessage=true;
	comment("For every brand or product a label must be attached.");
	cancel = true;
	}

loadASITables4ACA();
// load all asitables used;
if (appMatch("Licenses/Plant/Agricultural Liming Material/Application")) {
	submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
	}

if (appMatch("Licenses/Plant/Agricultural Liming Material/Application") && typeof(LIMEBRAND)== "object" && (submittedDocList.length < LIMEBRAND.length)) {
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
	}

if (appMatch("Licenses/Plant/Agricultural Liming Material/Renewal") && typeof(LIMEBRAND)== "object") {
	var limeTable = loadASITable("LIME BRAND", pId);
	var diffToUpload = LIMEBRAND.length - limeTable.length;
	if(diffToUpload >= 0){
	if(submittedDocList.length < diffToUpload){
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
			}
		}
	}

if (appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Application") && typeof(PRODUCTBRAND) == "object" && (submittedDocList.length < PRODUCTBRAND.length)) {
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
	}

if (appMatch("Licenses/Plant/Ammonium Nitrate Fertilizer/Renewal") && typeof(PRODUCTBRAND) == "object") {
	var amNiTable = loadASITable("PRODUCT / BRAND", pId);
	var diffToUpload = PRODUCTBRAND.length - amNiTable.length;
	if(diffToUpload >= 0){
	if(submittedDocList.length < diffToUpload){
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
			}
		}
	}

if (appMatch("Licenses/Plant/Commercial Compost/Application") && typeof(BRANDPRODUCTLIST) == "object" && (submittedDocList.length < BRANDPRODUCTLIST.length)) {
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
	}

if (appMatch("Licenses/Plant/Commercial Compost/Renewal") && typeof(BRANDPRODUCTLIST) == "object") {
	var compTable = loadASITable("BRAND/PRODUCT LIST", pId);
	var diffToUpload = BRANDPRODUCTLIST.length - compTable.length;
	if(diffToUpload >= 0){
	if(submittedDocList.length < diffToUpload){
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
			}
		}
	}

if (appMatch("Licenses/Plant/Commercial Fertilizer/Application") && typeof(FERTILIZERBRANDPRODUCTNAMES) == "object" && (submittedDocList.length < FERTILIZERBRANDPRODUCTNAMES.length)) {
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
	}

if (appMatch("Licenses/Plant/Commercial Fertilizer/Renewal") && typeof(FERTILIZERBRANDPRODUCTNAMES) == "object") {
	var brandTable = loadASITable("FERTILIZER BRAND/PRODUCT NAMES", pId);
	var diffToUpload = FERTILIZERBRANDPRODUCTNAMES.length - brandTable.length;
	if(diffToUpload >= 0){
	if(submittedDocList.length < diffToUpload){
	showMessage = true;
	comment("For every brand or product a label must be attached.");
	cancel=true;
			}
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

function loadASITable(tname) {

 	//
 	// Returns a single ASI Table array of arrays
	// Optional parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext())
	  {
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tname)) continue;

	  if (tsm.rowIndex.isEmpty())
	  	{
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

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

		}
		tempArray.push(tempObject);  // end of record
	  }
	  return tempArray;
	}

/*------------------------------------------------------------------------------------------------------/
| Custom Functions (End)
/------------------------------------------------------------------------------------------------------*/