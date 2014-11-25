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