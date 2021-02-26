import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    practice,
    doctor,
    name,
    phone,
    email,
    website,
    facebook_url,
    instagram_url,
    twitter_url,
    monday_op_hours,
    tuesday_op_hours,
    wednesday_op_hours,
    thursday_op_hours,
    friday_op_hours,
    saturday_op_hours,
    sunday_op_hours,
    address,
    route,
    street_number,
    city,
    county,
    state,
    state_short,
    country,
    country_short,
    zip,
    latitude,
    longitude,
  } = data;
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
      doctor,
    },
    UpdateExpression:
      "SET #nameAttr = :name, phone = :phone, email = :email, website = :website, facebook_url = :facebook_url, instagram_url = :instagram_url, twitter_url = :twitter_url, monday_op_hours = :monday_op_hours, tuesday_op_hours = :tuesday_op_hours, wednesday_op_hours = :wednesday_op_hours, thursday_op_hours = :thursday_op_hours, friday_op_hours = :friday_op_hours, saturday_op_hours = :saturday_op_hours, sunday_op_hours = :sunday_op_hours, address = :address, #routeAttr = :route, street_number = :street_number, city = :city, county = :county, #stateAttr = :state, state_short = :state_short, country = :country, country_short = :country_short, zip = :zip, latitude = :latitude, longitude = :longitude",
    ExpressionAttributeNames: {
      "#nameAttr": "name",
      "#stateAttr": "state",
      "#routeAttr": "route",
    },
    ExpressionAttributeValues: {
      ":name": name || "",
      ":phone": phone || "",
      ":email": email || "",
      ":website": website || "",
      ":facebook_url": facebook_url || "",
      ":instagram_url": instagram_url || "",
      ":twitter_url": twitter_url || "",
      ":monday_op_hours": monday_op_hours || "",
      ":tuesday_op_hours": tuesday_op_hours || "",
      ":wednesday_op_hours": wednesday_op_hours || "",
      ":thursday_op_hours": thursday_op_hours || "",
      ":friday_op_hours": friday_op_hours || "",
      ":saturday_op_hours": saturday_op_hours || "",
      ":sunday_op_hours": sunday_op_hours || "",
      ":address": address || "",
      ":route": route || "",
      ":street_number": street_number || "",
      ":city": city || "",
      ":county": county || "",
      ":state": state || "",
      ":state_short": state_short || "",
      ":country": country || "",
      ":country_short": country_short || "",
      ":zip": zip || "",
      ":latitude": latitude || "",
      ":longitude": longitude || "",
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
});
