const Notification = require("../model/notificationSchema");

const createNotification = async (formData) => {
  try {
    const NotificationCreated = new Notification(formData);
    return await NotificationCreated.save();
  } catch (error) {
    return error;
  }
};


module.exports = createNotification;


// let notification = await Notification.findOne({type:"pending", releventId:v?._id})
//         if(!notification){
//           createNotification({
//             message:"Payment is pending of "+v?.fullName +" and his due date is "+ moment(v?.dueDate).format('DD-MM-YYYY'),
//             type: "pending",
//             releventId: v?._id,
//           });
//         }


// let notification =  await createNotification({
//   message: "Congrats! You have added " + memberData.fullName + " to the gym on " + moment(memberCreated.createdAt).format('DD-MM-YYYY'),
//   type: "new",
//   releventId: memberCreated._id.toString()
// });