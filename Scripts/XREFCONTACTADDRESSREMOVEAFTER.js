aa.print("XRefContactAddressRemoveAfter debug");aa.print("Remove Cross Reference Contact Address Begin:");var capIDModel = aa.env.getValue("CapIdModel");aa.print("--------------Cap ID--------------");aa.print(capIDModel.getID1() + "-" + capIDModel.getID2() + "-" + capIDModel.getID3());aa.print("--------------Cap ID--------------");var capContactModel = aa.env.getValue("CapContactModel");var contactModel = capContactModel.getPeople();var compactAddress = contactModel.getCompactAddress();var attributes = contactModel.getAttributes();aa.print("--------------Contact Field--------------");aa.print("RefContactNumber = " + capContactModel.getRefContactNumber)aa.print("LastName = " + contactModel.getLastName());aa.print("FirstName = " + contactModel.getFirstName());aa.print("ContactType = " + contactModel.getContactType());aa.print("Phone1 = " + contactModel.getPhone1());aa.print("Email = " + contactModel.getEmail());aa.print("Phone2 = " + contactModel.getPhone2());aa.print("AddressLine1 = " + compactAddress.getAddressLine1());aa.print("AddressLine2 = " + compactAddress.getAddressLine2());aa.print("AddressLine3 = " + compactAddress.getAddressLine3());aa.print("City = " + compactAddress.getCity());aa.print("State = " + compactAddress.getState());aa.print("Zip = " + compactAddress.getZip());aa.print("Comment = " + contactModel.getComment());aa.print("BusinessName = " + contactModel.getBusinessName());aa.print("MiddleName = " + contactModel.getMiddleName());aa.print("Fax = " + contactModel.getFax());aa.print("Relation = " + contactModel.getRelation());aa.print("FullName = " + contactModel.getFullName());aa.print("CountryCode = " + compactAddress.getCountryCode());aa.print("ContactSeqNumber = " + contactModel.getContactSeqNumber());aa.print("AuditStatus = " + contactModel.getAuditStatus());aa.print("PreferredChannel = " + contactModel.getPreferredChannel());aa.print("Phone3 = " + contactModel.getPhone3());aa.print("Salutation = " + contactModel.getSalutation());aa.print("Gender = " + contactModel.getGender());aa.print("PostOfficeBox = " + contactModel.getPostOfficeBox());aa.print("BirthDate = " + contactModel.getBirthDate());aa.print("SocialSecurityNumber = " + contactModel.getMaskedSsn());aa.print("Fein = " + contactModel.getFein());aa.print("TradeName = " + contactModel.getTradeName());aa.print("Title = " + contactModel.getTitle());aa.print("Namesuffix = " + contactModel.getNamesuffix());aa.print("--------------Contact Attribute--------------");if (attributes != "" && attributes != null){	var attribute;	for (var i = 0; i < attributes.size(); i++)	{		attribute = attributes.get(i);		aa.print(attribute.getAttributeName() + " = " + attribute.getAttributeValue());	}}aa.print("--------------Contact Field--------------");aa.print("--------------Remove Cross Reference Contact Address List--------------");var xRefContactAddressModelList = aa.env.getValue("RemovedXRefContactAddressModelList");if (xRefContactAddressModelList != "" && xRefContactAddressModelList != null){	for (var i = 0; i < xRefContactAddressModelList.size(); i++)	{		var xRefContactAddressModel = xRefContactAddressModelList.get(i);				if (xRefContactAddressModel != "" && xRefContactAddressModel != null)		{			aa.print("--------------Remove Cross Reference Contact Address " + (i + 1) + " Field--------------");			if (xRefContactAddressModel != "" && xRefContactAddressModel != null)			{				var xRefContactAddressPKModel = xRefContactAddressModel.getXRefContactAddressPK();				aa.print("XRefEntityType = " + xRefContactAddressPKModel.getEntityType());				aa.print("XRefEntityID = " + xRefContactAddressPKModel.getEntityID());				aa.print("XRefAddressID = " + xRefContactAddressPKModel.getAddressID());								var contactAddressModel = xRefContactAddressModel.getContactAddress();							if (contactAddressModel != "" && contactAddressModel != null)				{					var contactAddressPKModel = contactAddressModel.getContactAddressPK();					var auditModel = contactAddressModel.getAuditModel();										if (contactAddressPKModel != "" && contactAddressPKModel != null)					{						aa.print("ServiceProviderCode = " + contactAddressPKModel.getServiceProviderCode());						aa.print("AddressID = " + contactAddressPKModel.getAddressID());					}										aa.print("EntityType = " + contactAddressModel.getEntityType());					aa.print("EntityID = " + contactAddressModel.getEntityID());					aa.print("AddressType = " + contactAddressModel.getAddressType());					aa.print("EffectiveDate = " + contactAddressModel.getEffectiveDate());					aa.print("ExpirationDate = " + contactAddressModel.getExpirationDate());					aa.print("Recipient = " + contactAddressModel.getRecipient());					aa.print("FullAddress = " + contactAddressModel.getFullAddress());					aa.print("AddressLine1 = " + contactAddressModel.getAddressLine1());					aa.print("AddressLine2 = " + contactAddressModel.getAddressLine2());					aa.print("AddressLine3 = " + contactAddressModel.getAddressLine3());					aa.print("HouseNumberStart = " + contactAddressModel.getHouseNumberStart());					aa.print("HouseNumberEnd = " + contactAddressModel.getHouseNumberEnd());					aa.print("StreetDirection = " + contactAddressModel.getStreetDirection());					aa.print("StreetPrefix = " + contactAddressModel.getStreetPrefix());					aa.print("StreetName = " + contactAddressModel.getStreetName());					aa.print("StreetSuffix = " + contactAddressModel.getStreetSuffix());					aa.print("UnitType = " + contactAddressModel.getUnitType());					aa.print("UnitStart = " + contactAddressModel.getUnitStart());					aa.print("UnitEnd = " + contactAddressModel.getUnitEnd());					aa.print("StreetSuffixDirection = " + contactAddressModel.getStreetSuffixDirection());					aa.print("CountryCode = " + contactAddressModel.getCountryCode());					aa.print("City = " + contactAddressModel.getCity());					aa.print("State = " + contactAddressModel.getState());					aa.print("Zip = " + contactAddressModel.getZip());					aa.print("Phone = " + contactAddressModel.getPhone());					aa.print("PhoneCountryCode = " + contactAddressModel.getPhoneCountryCode());					aa.print("Fax = " + contactAddressModel.getFax());					aa.print("FaxCountryCode = " + contactAddressModel.getFaxCountryCode());										if (auditModel != "" && auditModel != null)					{						aa.print("AuditID = " + auditModel.getAuditID());						aa.print("AuditStatus = " + auditModel.getAuditStatus());						aa.print("AuditDate = " + auditModel.getAuditDate());					}				}								aa.print("--------------Remove Cross Reference Contact Address " + (i + 1) + " Field--------------");			}		}	}}aa.print("--------------Remove Cross Reference Contact Address List--------------");aa.print("Remove Cross Reference Contact Address End:");aa.env.setValue("ScriptReturnCode","0");aa.env.setValue("ScriptReturnMessage", "Remove Cross Reference Contact Address successful");