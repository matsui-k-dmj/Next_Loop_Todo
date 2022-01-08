"use strict";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.database();

/**
 * Run once a day at midnight, to cleanup the users
 * Manually run the task here https://console.cloud.google.com/cloudscheduler
 */
exports.accountcleanup = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    functions.logger.log("Running account cleanup");
    // Fetch all user details.
    const inactiveUsers = await getInactiveUsers([], undefined);
    // Use a pool so that we delete maximum `MAX_CONCURRENT` users in parallel.

    for (const user of inactiveUsers) {
      try {
        await deleteInactiveUser(user);
      } catch (error) {
        continue;
      }
    }

    functions.logger.log("User cleanup finished");
  });

/**
 * Deletes one inactive user from the list.
 */
function deleteInactiveUser(userToDelete: admin.auth.UserRecord) {
  if (userToDelete == null) return null;

  // Delete the inactive user.
  return admin
    .auth()
    .deleteUser(userToDelete.uid)
    .then(() => {
      // 削除したユーザのデータも消す
      return db.ref(`users/${userToDelete.uid}`).set(null);
    })
    .then(() => {
      return functions.logger.log(
        "Deleted user account",
        userToDelete.uid,
        "because of inactivity"
      );
    })
    .catch((error) => {
      return functions.logger.error(
        "Deletion of inactive user account",
        userToDelete.uid,
        "failed:",
        error
      );
    });
}

/**
 * Returns the list of all inactive users.
 */
async function getInactiveUsers(
  users: admin.auth.UserRecord[] = [],
  nextPageToken: string | undefined
): Promise<admin.auth.UserRecord[]> {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  // Find users that have not signed in in the last 30 days.
  const inactiveUsers = result.users.filter((user) => {
    if (user.providerData.length > 0) {
      // Google ログインしてるユーザは 1年保存
      return (
        Date.parse(user.metadata.lastSignInTime) <
        Date.now() - 365 * 24 * 60 * 60 * 1000
      );
    } else {
      // 匿名ユーザは30日で消す
      return (
        Date.parse(user.metadata.lastSignInTime) <
        Date.now() - 7 * 24 * 60 * 60 * 1000
      );
    }
  });

  // Concat with list of previously found inactive users if there was more than 1000 users.
  users = users.concat(inactiveUsers);

  // If there are more users to fetch we fetch them.
  if (result.pageToken) {
    return getInactiveUsers(users, result.pageToken);
  }

  return users;
}
