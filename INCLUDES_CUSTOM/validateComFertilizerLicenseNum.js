function validateComFertilizerLicenseNum(licNumVal) {

    if (!isEmpty(licNumVal) && !isBlank(licNumVal)) {

        //check to see if license is valid
        var licCap = aa.cap.getCapID(licNumVal).getOutput();

        if (licCap == null) {
            return false;
        }

        //check to see if Licenses/Plant/Commercial Fertilizer/License
        myCap = aa.cap.getCap(licCap).getOutput();

        if (!appMatch("Licenses/Plant/Commercial Fertilizer/License",licCap)) {
            logDebug("Invalid license type");
            return false;
        }

        var licObj = new licenseObject(licNumVal,licCap);

        if (licObj) {
            if (matches(licObj.getStatus(),"About to Expire","Active")) {
                logDebug("Valid record");
                return true;
            } else {
                logDebug("Invalid status: " + licObj.getStatus());
            }
        } else {
            logDebug("Could not get license object");
            return false;
        }
/*
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

                if (matches(this.b1Status,statActive,statAbouttoExpr)) {
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
        } */
    }
    return false;
}