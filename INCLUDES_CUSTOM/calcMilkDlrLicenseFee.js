function calcMilkDlrLicenseFee(poundsSold) {

    var licenseFee = 0;

    if (poundsSold <= 4000) return 100;

    if (poundsSold > 740000) return 7500;

    licenseFee = Math.floor(poundsSold / 4000) * 40 + 100;

    return licenseFee;

}