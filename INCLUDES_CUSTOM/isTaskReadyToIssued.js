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