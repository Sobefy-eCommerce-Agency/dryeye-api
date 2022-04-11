import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
import { createAffiliate, getAffiliate } from "../../utils/fetch";
import { GenerateImageBuffer } from "../../utils/utils";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    doctor,
    customer,
    firstName,
    lastName,
    email,
    practice,
    createAffiliateAccount,
    profilePicture,
  } = data;

  // Get Afilliate ID
  let affiliateID = "";

  if (email) {
    const affilliate = await getAffiliate(email);
    const isValidAffiliate = affilliate.data?.data?.affiliates?.length > 0;

    if (createAffiliateAccount && !isValidAffiliate) {
      // Create affiliate
      const newAffiliate = await createAffiliate({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: null,
        send_welcome: true,
      });

      affiliateID = newAffiliate?.data?.id || "";
    }
    if (!createAffiliateAccount) {
      console.log(`removing affiliate: ${email}`);
    }
  }

  // Generate Image Buffer
  let imageBuffer = [];

  // Add image gallery
  if (profilePicture && profilePicture.length > 0) {
    const profilePictureBuffer = await GenerateImageBuffer(profilePicture);

    if (profilePictureBuffer && profilePictureBuffer.length > 0) {
      imageBuffer = profilePictureBuffer;
    }
  }

  const params = {
    TableName: process.env.my_doctors_table,
    Key: {
      doctor,
      owner: customer,
    },
    UpdateExpression:
      "SET firstName = :firstName, lastName = :lastName, email = :email, practice = :practice, createAffiliateAccount = :createAffiliateAccount, affiliateID = :affiliateID, profilePicture = :profilePicture",
    ExpressionAttributeValues: {
      ":firstName": firstName || null,
      ":lastName": lastName || null,
      ":email": email || null,
      ":practice": practice || null,
      ":createAffiliateAccount": createAffiliateAccount || false,
      ":affiliateID": affiliateID || "",
      ":profilePicture": imageBuffer,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
}, true);
