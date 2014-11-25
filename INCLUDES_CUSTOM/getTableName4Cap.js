 function getTableName4Cap(strType) {
     aa.print("strType:" + strType);

     if(strType.equals("Agricultural Liming Material")){
        return "LIME BRAND";
     }else if(strType.equals("Soil or Plant Inoculant")){
        return "PRODUCT";
     }else if(strType.equals("Commercial Fertilizer")){
        return "FERTILIZER BRAND/PRODUCT NAMES";
     }else if(strType.equals("Commercial Compost")){
        return "BRAND/PRODUCT LIST";
    } else if (strType.equals("Ammonium Nitrate Fertilizer")) {
        return "PRODUCT / BRAND";
    } else {
        aa.print("Table name not found for " + strType);
        return;
     }
 }

//find if all product info is same