function updateProduct() {

    var pProdCapID = getParent();
    aa.print("pProdCapID: " + pProdCapID.getCustomID());

    //load asi
    loadAppSpecific(AInfo, capId);

    //copy asi from child to parent
    copyAppSpecific(pProdCapID);

    //copy asit from child to parent
    CopyASITablesFromParent(capId, pProdCapID); //pFromCapID, pToCapId

    aa.print("Parent product updated.");

}