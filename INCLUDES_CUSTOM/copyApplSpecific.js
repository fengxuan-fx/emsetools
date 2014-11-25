function copyApplSpecific(pFromCapID, pToCapId) // copy all App Specific info into new Cap
{
    var AInfo = new Array();
    loadApplSpecific(AInfo, pFromCapID);

    for (asi in AInfo) {
        editApplSpecific(asi, AInfo[asi], pToCapId, AInfo);
    }
}