/*------------------------------------------------------------------------------------------------------/
| Program: Batch Expiration.js  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/01/08 JHS
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
maxSeconds = 4.5 * 300;         // number of seconds allowed for batch processing, usually < 5*60
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

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

eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_BATCH"));


function getScriptText(vScriptName) {
   vScriptName = vScriptName.toUpperCase();
   var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
   var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
   return emseScript.getScriptText() + "";
}




/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;


batchJobID = 0;
if (batchJobResult.getSuccess()) {
   batchJobID = batchJobResult.getOutput();
   logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else
   logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var recordType = aa.env.getValue("recordType");
var reportName = aa.env.getValue("reportName");

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() 
{
    var tDate=sysDateMMDDYYYY;
    var existingSet;
    var setID4Process;
  //var reportName="License Certificate";

//search for the pending set for the date
var setScriptSearch = aa.set.getSetHeaderScriptModel().getOutput();
setScriptSearch.setSetID(recordType + "_" + tDate + "_");
setScriptSearch.setSetStatus("Pending");
var setHeaderList = aa.set.getSetHeaderListByModel(setScriptSearch);

if (setHeaderList.getSuccess()) {
  var setList = setHeaderList.getOutput();
  setID4Process = String(setList.get(0).getSetID());

  var setMembers=aa.set.getCAPSetMembersByPK(setID4Process);
  //aa.print(setMembers);
  //aa.print(setMembers.getOutput()); 

  var array = new Array();

  array = setMembers.getOutput();

  logDebug("Number of CAP members: " + array.size());
  
  for(var i=0; i < array.size(); i++)
  {
      var setMember=array.get(i);  
      //aa.print(setMember);
      setMember= setMember.toString();
      var ids=new Array();
      ids=setMember.split("-");
      aa.print(ids[0] + " " + ids[1] + " " + ids[2]);
      var license=aa.cap.getCap(ids[0],ids[1],ids[2]);
      license=license.getOutput();
      var licenseID=license.getCapID();
      logDebug("License: " + licenseID.getCustomID());

      var contactObjs = getContactObjs(licenseID,["Additional Location","Business"]);

      if (contactObjs) {
        for (thisCon in contactObjs) {
          var thisContact = contactObjs[thisCon];
          runReport(reportName,licenseID,thisContact.seqNumber)
        }
      }
   }
      var setUpdate= new capSet(existingSet.getSetID());
      setUpdate.status="Completed";
      setUpdate.comment="Successfully processed";
      setUpdate.update();

}

/*
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
              existingSet=setResult;
              break;
          }
      }
  }
*/


}

function runReport(reportName,itemCap,cSeqNumber) {
        //run the report for the business contact
      report=aa.reportManager.getReportInfoModelByName(reportName);
      report=report.getOutput();
      //aa.print(report);
      report.setCapId(itemCap);
      report.setModule("Licenses");
      var parameters=aa.util.newHashMap();
      parameters.put("capID", itemCap.getCustomID());
      parameters.put("cSeqNumber", cSeqNumber);
      parameters.put("recordStatus", "Active");
      report.setReportParameters(parameters); 
      //aa.print("Report ID: " + report.getReportId());
      logDebug("Report parameters: "+ report.getReportParameters());
      var checkPermission=aa.reportManager.hasPermission("License Certificate","admin");
      //aa.print("Permission: " + checkPermission.getOutput().booleanValue());
      if(checkPermission.getOutput().booleanValue())
      {
            //aa.print("User has permission");    
            var reportResult=aa.reportManager.getReportResult(report);
            if(reportResult)
            {
              reportResult=reportResult.getOutput();
              logDebug("Report result: " + reportResult);
              reportFile=aa.reportManager.storeReportToDisk(reportResult);
              reportFile=reportFile.getOutput();
              logDebug("Report File: " +reportFile);
            }       
       }
}