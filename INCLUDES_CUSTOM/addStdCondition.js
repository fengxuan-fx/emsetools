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