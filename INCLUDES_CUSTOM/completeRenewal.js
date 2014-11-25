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