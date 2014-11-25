function calculateLicenseFees() {

    myCap = aa.cap.getCap(capId).getOutput();
    myAppTypeString = myCap.getCapType().toString();
    myAppTypeArray = myAppTypeString.split("/");

    //table to use the product quanity
    var tblName = "PRODUCT";
    var totalProducts = 0;

    //fee variables
    var fcode = "PLNT_SPI";
    var fsched = "PLNT_SPI";
    var fperiod = "FINAL";
    var fqty = 1;
    var finvoice = "N";

    //get the product table
    var arrASIT = loadASITable(tblName);

    if ((!isEmpty(arrASIT.length) || isBlank(!arrASIT.length))) {
        totalProducts = arrASIT.length;
    }

    if (totalProducts > 0) {
        //check the type
        if (myAppTypeArray[2].toUpperCase().equals("SOIL OR PLANT INOCULANT") || myAppTypeArray[2].toUpperCase().equals("ADD PRODUCT")) {
            if (myAppTypeArray[3].toUpperCase().equals("LICENSE") || myAppTypeArray[3].toUpperCase().equals("RENEWAL") ||
            myAppTypeArray[3].toUpperCase().equals("APPLICATION") || myAppTypeArray[3].toUpperCase().equals("NA")) {
                //aa.print("Adding fees");

                //set the quanity
                fqty = totalProducts;

                // add Fee 
                addFee(fcode, fsched, fperiod, fqty, finvoice);
            }
        }
    }
}