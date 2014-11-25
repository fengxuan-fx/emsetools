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